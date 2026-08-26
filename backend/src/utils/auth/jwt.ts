import { env } from "../../config/env.config.js";
import { AccessTokenPayload, RefreshTokenPayload } from "../../modules/auth/auth.types.js";
import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";

export const signAccessToken = (payload: AccessTokenPayload) => {
    return jwt.sign(payload, env.ACCESS_TOKEN_SECRET, {
        expiresIn: env.ACCESS_TOKEN_EXPIRES_IN as SignOptions["expiresIn"],
    });
};

export const signRefreshToken = (payload: RefreshTokenPayload) => {
    return jwt.sign(payload, env.REFRESH_TOKEN_SECRET, {
        expiresIn: env.REFRESH_TOKEN_EXPIRES_IN as SignOptions["expiresIn"],
    });
};

export const verifyAccessToken = (
    token: string
) : AccessTokenPayload => {
    const decoded = jwt.verify(
        token, 
        env.ACCESS_TOKEN_SECRET
    ) as JwtPayload;

    if (
        typeof decoded.sub !== "string" || 
        decoded.type !== "access" || 
        typeof decoded.sessionId !== "string"
    ) {
        throw new Error("Invalid access token payload");
    }

    return {
        sub: decoded.sub,
        sessionId: decoded.sessionId,
        type: "access",
    };
};

export const verifyRefreshToken = (token: string) : RefreshTokenPayload => {
    const decoded = jwt.verify(
        token, 
        env.REFRESH_TOKEN_SECRET
    ) as JwtPayload;

    if (
        typeof decoded.sub !== "string" || 
        decoded.type !== "refresh" || 
        typeof decoded.sessionId !== "string" ||
        typeof decoded.tokenId !== "string" ||
        typeof decoded.familyId !== "string"
    ) {
        throw new Error("Invalid refresh token payload");
    }

    return {
        sub: decoded.sub,
        sessionId: decoded.sessionId,
        tokenId: decoded.tokenId,
        familyId: decoded.familyId,
        type: "refresh",
    };
};