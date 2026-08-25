import crypto from "crypto";
import { Response } from "express";
import ms from "ms";
import { env } from "../../config/env.config.js";

export const hashRefreshToken = (refreshToken: string) => {
    return crypto.createHash("sha256").update(refreshToken).digest("hex");
};

export const generateSessionId = () => {
    return crypto.randomUUID();
};

const refreshTokenMaxAge = ms(env.REFRESH_TOKEN_EXPIRES_IN as ms.StringValue);

if (typeof refreshTokenMaxAge !== "number") {
    throw new Error("Invalid refresh token expiry configuration");
}

const refreshCookieOptions = {
    httpOnly: true, // blocks document.cookie from accessing cookie
    secure: env.NODE_ENV === "production", // if true it is only used for HTTPs
    sameSite: "lax" as const,
    maxAge: refreshTokenMaxAge,
    // path: "/api/v1/auth/refresh-token", // pass the refresh token path here
}

export const setCookies = (res: Response, refreshToken: string) => {
    res.cookie("refreshToken", refreshToken, refreshCookieOptions);
};

export const clearCookies = (res: Response) => {
    res.clearCookie("refreshToken", refreshCookieOptions);
};