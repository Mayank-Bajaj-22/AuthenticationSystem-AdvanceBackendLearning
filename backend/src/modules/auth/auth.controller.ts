import { Request, Response } from "express";
import { CatchAsync } from "../../utils/common/helpers/CatchAsync.js";
import { authService } from "./auth.container.js";
import { sendResponse } from "../../utils/common/response/AppResponse.js";
import { clearCookies, setCookies } from "../../utils/auth/auth.helper.js";
import { AppError } from "../../utils/common/errors/AppError.js";

export const registerUserController = CatchAsync(
    async (req: Request, res: Response) => {
        const { email, password } = req.body;

        const deviceName = req.headers["sec-ch-ua-platform"]?.toString() ?? "Unknown Device";
        const userAgent = req.headers["user-agent"] ?? "Unknown";
        const ipAddress = req.ip ?? "Unknown";

        const result = await authService.registerUser({
            email,
            password,
            deviceName,
            userAgent,
            ipAddress,
        });

        setCookies(res, result.refreshToken);

        sendResponse(res, 201, {
            success: true,
            message: "User registered successfully",
            data: {
                user: result.user,
                accessToken: result.accessToken,
            },
        });
    },
);

export const loginUserController = CatchAsync(
    async (req: Request, res: Response) => {
        const { email, password } = req.body;

        const deviceName = req.headers["sec-ch-ua-platform"]?.toString() ?? "Unknown Device";
        const userAgent = req.headers["user-agent"] ?? "Unknown";
        const ipAddress = req.ip ?? "Unknown";

        const result = await authService.loginUser({
            email,
            password,
            deviceName,
            userAgent,
            ipAddress,
        });

        setCookies(res, result.refreshToken);

        sendResponse(res, 200, {
            success: true,
            message: "User logged in successfully",
            data: {
                user: result.user,
                accessToken: result.accessToken,
            },
        });
    },
);

export const loggedInUserController = CatchAsync(
    async (req: Request, res: Response) => {
        const user = req.user;

        if (!user) {
            throw new AppError(
                "User not found",
                404,
            );
        }

        const result = await authService.getLoggerInUser(user);
        
        sendResponse(res, 200, {
            success: true,
            message: "User fetched successfully",
            data: result,
        });
    },
);

export const refreshAccessTokenController = CatchAsync(
    async (req: Request, res: Response) => {
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            throw new AppError(
                "Refresh token is required",
                401,
            );
        }

        const result = await authService.refreshAccessToken(refreshToken);

        setCookies(res, result.refreshToken);

        sendResponse(res, 200, {
            success: true,
            message: "Token refreshed successfully",
            data: {
                accessToken: result.accessToken,
            },
        });
    },
);

export const logoutController = CatchAsync(
    async (req: Request, res: Response) => {
        const user = req.user;

        if (!user) {
            throw new AppError(
                "Authentication required",
                401,
            );
        }

        await authService.logoutCurrentSession(
            user.userId,
            user.sessionId,
        );

        clearCookies(res);

        sendResponse(res, 200, {
            success: true,
            message: "Logged out successfully",
        });
    },
);

export const logoutAllSessionsController = CatchAsync(
    async (req: Request, res: Response) => {
        const user = req.user;

        if (!user) {
            throw new AppError(
                "Authentication required",
                401,
            );
        }

        await authService.logoutAllSessions(
            user.userId,
        );

        clearCookies(res);

        sendResponse(res, 200, {
            success: true,
            message: "Logged out from all sessions successfully",
        });
    },
);

export const revokeSessionContoller = CatchAsync(
    async(req: Request, res: Response) => {
        const user = req.user;

        if (!user) {
            throw new AppError(
                "Authentication required",
                401,
            );
        }

        const sessionId = req.params.sessionId as string;

        if (!sessionId) {
            throw new AppError(
                "Session ID is required",
                400,
            );
        }

        await authService.logoutCurrentSession(
            user.userId,
            sessionId,
        );

        sendResponse(res, 200, {
            success: true,
            message: "Session revoked successfully",
        });
    },
);