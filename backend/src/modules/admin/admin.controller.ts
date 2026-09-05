import { Request, Response } from "express";
import { CatchAsync } from "../../utils/common/helpers/CatchAsync.js";
import { adminService } from "./admin.container.js";
import { sendResponse } from "../../utils/common/response/AppResponse.js";

export const getAllUsersController = CatchAsync(
    async (req: Request, res: Response) => {
        const result = await adminService.getAllUsers();

        sendResponse(res, 200, {
            success: true,
            message: "Users fetched successfully",
            data: result,
        });
    },
);