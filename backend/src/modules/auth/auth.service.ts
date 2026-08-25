import ms from "ms";
import { env } from "../../config/env.config.js";
import { generateSessionId, hashRefreshToken } from "../../utils/auth/auth.helper.js";
import { signAccessToken, signRefreshToken } from "../../utils/auth/jwt.js";
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

        const accessToken = signAccessToken({
            sub: userId,
            sessionId,
        });

        const refreshToken = signRefreshToken({
            sub: userId,
            sessionId,
        });

        const hashedRefreshToken = hashRefreshToken(refreshToken);

        const refreshTokenExpiresIn = ms(
            env.REFRESH_TOKEN_EXPIRES_IN as ms.StringValue,
        );

        if (typeof refreshTokenExpiresIn !== "number") {
            throw new Error("Invalid refresh token expiry configuration");
        }

        const expiresAt = new Date(Date.now() + refreshTokenExpiresIn);

        await this.authRepo.createSession({
            id: sessionId,
            userId: userId,
            deviceName: deviceName,
            userAgent: userAgent,
            ipAddress: ipAddress,
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
                400,
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

        const authSession = await this.createAuthenticatedSession(
            existingUser.id,
            data.deviceName,
            data.userAgent,
            data.userAgent,
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
}