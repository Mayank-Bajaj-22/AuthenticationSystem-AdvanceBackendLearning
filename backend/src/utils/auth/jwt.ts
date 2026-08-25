import { env } from "../../config/env.config.js";
import { AccessTokenPayload, JWTPayload, RefreshTokenPayload } from "../../modules/auth/auth.types.js";
import jwt, { SignOptions } from "jsonwebtoken";

export const signAccessToken = (payload: JWTPayload) => {
    return jwt.sign(payload, env.ACCESS_TOKEN_SECRET, {
        expiresIn: env.ACCESS_TOKEN_EXPIRES_IN as SignOptions["expiresIn"],
    });
};

export const signRefreshToken = (payload: JWTPayload) => {
    return jwt.sign(payload, env.REFRESH_TOKEN_SECRET, {
        expiresIn: env.REFRESH_TOKEN_EXPIRES_IN as SignOptions["expiresIn"],
    });
};

export const verifyAccessToken = (token: string) => {
    return jwt.verify(token, env.ACCESS_TOKEN_SECRET) as AccessTokenPayload;
};

export const verifyRefreshToken = (token: string) => {
    return jwt.verify(token, env.REFRESH_TOKEN_SECRET) as RefreshTokenPayload;
};