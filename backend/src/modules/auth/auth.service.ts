import ms from "ms";
import { env } from "../../config/env.config.js";
import { generateFamilyId, generateSessionId, generateTokenId, hashRefreshToken } from "../../utils/auth/auth.helper.js";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../../utils/auth/jwt.js";
import { comparePassword, hashPassword } from "../../utils/auth/password.js";
import { AppError } from "../../utils/common/errors/AppError.js";
import { IAuthRepository } from "./auth.interface.js";
import { sanitizedUserResponse } from "./auth.response.js";
import { UserType } from "./auth.types.js";

export class AuthService {
    constructor(
        private authRepo: IAuthRepository,
    ) {}

    async createAuthenticatedSession(
        userId: string,
        deviceName: string,
        userAgent: string,
        ipAddress: string,
    ) {
        const sessionId = generateSessionId();
        const tokenId = generateTokenId();
        const familyId = generateFamilyId();

        const accessToken = signAccessToken({
            sub: userId,
            sessionId,
            type: "access",
        });

        const refreshToken = signRefreshToken({
            sub: userId,
            sessionId,
            tokenId,
            familyId,
            type: "refresh",
        });

        const tokenHash = hashRefreshToken(refreshToken);

        const refreshTokenExpiresIn = ms(
            env.REFRESH_TOKEN_EXPIRES_IN as ms.StringValue,
        );

        if (typeof refreshTokenExpiresIn !== "number") {
            throw new Error("Invalid refresh token expiry configuration");
        }

        const expiresAt = new Date(Date.now() + refreshTokenExpiresIn);

        await this.authRepo.createSession({
            id: sessionId,
            userId,
            deviceName,
            userAgent,
            ipAddress,
            expiresAt,
        });

        await this.authRepo.createRefreshToken({
            id: tokenId,
            sessionId,
            tokenHash,
            familyId,
            expiresAt,
        });

        return {
            accessToken,
            refreshToken,
        };
    }

    async registerUser(data: {
        email: string;
        password: string;
        deviceName: string;
        userAgent: string;
        ipAddress: string;
    }) {
        const existingUser = 
            await this.authRepo.findUserByEmail(data.email);

        if (existingUser) {
            throw new AppError(
                "User with this email already exists!",
                409,
            );
        }

        const hashedPassword = await hashPassword(data.password);

        const createdUser = 
            await this.authRepo.createUser({
                email: data.email,
                hashedPassword,
            });

        const authSession = await this.createAuthenticatedSession(
            createdUser.id,
            data.deviceName,
            data.userAgent,
            data.ipAddress,
        );
        
        return {
            user: sanitizedUserResponse(createdUser),
            ...authSession,
        };
    }

    async loginUser(data: {
        email: string;
        password: string;
        deviceName: string;
        userAgent: string;
        ipAddress: string;
    }) {
        const existingUser = 
            await this.authRepo.findUserByEmail(data.email);

        if (!existingUser || !existingUser.passwordHash) {
            throw new AppError(
                "Invalid credentials",
                401,
            );
        }

        const isPasswordCorrect = 
            await comparePassword(data.password, existingUser.passwordHash);

        if (!isPasswordCorrect) {
            throw new AppError(
                "Invalid credentials",
                401,
            );
        }

        if (existingUser.status !== "ACTIVE") {
            throw new AppError(
                "User account is not active",
                403,
            );
        }

        const authSession = await this.createAuthenticatedSession(
            existingUser.id,
            data.deviceName,
            data.userAgent,
            data.ipAddress,
        );

        return {
            user: sanitizedUserResponse(existingUser),
            ...authSession,
        };
    }

    async getLoggerInUser(
        data: UserType,
    ) {
        const user =
            await this.authRepo.findUserById(data.userId);

        if (!user) {
            throw new AppError(
                "User not found",
                404,
            );
        }

        return user;
    }

    async refreshAccessToken(
        refreshToken: string,
    ) {
        let payload;

        // 1. verify jwt
        try {
            payload = verifyRefreshToken(refreshToken);
        } catch (error) {
            throw new AppError(
                "Invalid or expired refresh token",
                401,
            );
        }

        // 2. find token in db
        const storedToken = 
            await this.authRepo.findRefreshTokenById(
                payload.tokenId,
            );

        if (!storedToken) {
            throw new AppError(
                "Invalid refresh token",
                401,
            );
        }

        // 3. check token family
        if (storedToken.familyId !== payload.familyId) {
            await this.authRepo.revokeTokenFamily(
                storedToken.familyId,
            );

            throw new AppError(
                "Refresh token family mismatch",
                401,
            );
        }

        // 4. check session
        if (storedToken.sessionId !== payload.sessionId) {
            await this.authRepo.revokeTokenFamily(
                storedToken.familyId,
            );

            throw new AppError(
                "Refresh token session mismatch",
                401,
            );
        }

        // 5. replay detection
        if (storedToken.revokedAt) {
            await this.authRepo.revokeTokenFamily(
                storedToken.familyId,
            );

            throw new AppError(
                "Refresh token reuse detected",
                401,
            );
        }

        // 6. check db expiration
        if (storedToken.expiresAt.getTime() <= Date.now()) {
            throw new AppError(
                "Refresh token expired",
                401,
            );
        }

        // 7. hash incoming token
        const incomingToken = hashRefreshToken(refreshToken);

        // 8. compare hash
        if (incomingToken !== storedToken.tokenHash) {
            await this.authRepo.revokeTokenFamily(
                storedToken.familyId,
            );

            throw new AppError(
                "Invalid refresh token",
                401,
            );
        }

        // 9. create new token
        const newTokenId = generateTokenId();

        const familyId = storedToken.familyId;
        const sessionId = storedToken.sessionId;

        const accessToken = signAccessToken({
            sub: payload.sub,
            sessionId,
            type: "access",
        });

        const newRefreshToken = signRefreshToken({
            sub: payload.sub,
            sessionId,
            tokenId: newTokenId,
            familyId,
            type: "refresh",
        });

        const newTokenHash = hashRefreshToken(newRefreshToken);

        // 10. new expiration
        const refreshTokenExpiresIn = ms(
            env.REFRESH_TOKEN_EXPIRES_IN as ms.StringValue,
        );

        if (typeof refreshTokenExpiresIn !== "number") {
            throw new Error(
                "Invalid refresh token expiry configuration",
            );
        }

        const newExpiresAt = new Date(Date.now() + refreshTokenExpiresIn);

        // 11. atomic rotation
        try {
            await this.authRepo.rotateRefreshToken(
                storedToken.id,
                {
                    id: newTokenId,
                    sessionId,
                    tokenHash: newTokenHash,
                    familyId,
                    expiresAt: newExpiresAt,
                },
            );
        } catch (error) {
            // Another request may have already
            // consumed this refresh token.

            await this.authRepo.revokeTokenFamily(
                familyId,
            );

            throw new AppError(
                "Refresh token reuse detected",
                401,
            );
        }

        // 12. return tokens
        return {
            accessToken,
            refreshToken:
                newRefreshToken,
        };
    }

    async logoutCurrentSession(
        userId: string,
        sessionId: string,
    ): Promise<void> {
        const session = 
            await this.authRepo.findSessionById(sessionId);

        if (!session) {
            throw new AppError(
                "Session not found",
                404,
            );
        }

        if (session.userId !== userId) {
            throw new AppError(
                "You are not authorized to revoke this session",
                403,
            );
        }

        if (session.revokedAt) {
            return;
        }

        await this.authRepo.revokeSession(
            sessionId,
        );
    }

    async logoutAllSessions(
        userId: string,
    ): Promise<void> {
        await this.authRepo.revokeAllUserSessions(
            userId,
        );
    }
}