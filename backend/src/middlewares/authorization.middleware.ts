import { NextFunction, Request, Response } from "express";
import { Permissions } from "../constants/permissions.js";
import { AppError } from "../utils/common/errors/AppError.js";
import { authorizationService } from "../modules/authorization/authorization.container.js";

export const authorizePermissions = 
    (...requiredPermissions: Permissions[]) => 
        async (req: Request, res: Response, next: NextFunction) : Promise<void> => {
            try {
                if (!req.user) {
                    return next(
                        new AppError("Authentication required", 401),
                    );
                }

                if (requiredPermissions.length === 0) {
                    return next();
                }

                await authorizationService.authorize(
                    req.user.userId,
                    requiredPermissions,
                );

                next();
            } catch (error) {
                next(error);
            }
        };