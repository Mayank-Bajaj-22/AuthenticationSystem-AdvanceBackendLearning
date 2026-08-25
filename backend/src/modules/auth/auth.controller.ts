import { Request, Response } from "express";
import { CatchAsync } from "../../utils/common/helpers/CatchAsync.js";
import { authService } from "./auth.container.js";
import { sendResponse } from "../../utils/common/response/AppResponse.js";
import { setCookies } from "../../utils/auth/auth.helper.js";

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