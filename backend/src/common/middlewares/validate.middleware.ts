import { NextFunction, Request, Response } from "express";
import { ZodError, ZodObject } from "zod";
import { AppError } from "../../utils/common/errors/AppError.js";

export const validate = 
    (
        schema: ZodObject,
        source: "body" | "query" | "params" = "body",
    ) => (
        req: Request,
        _res: Response,
        next: NextFunction,
    ) => {
        try {
            schema.parse(req[source]);
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                throw new AppError(
                    error.issues
                        .map(
                            (issue) => 
                                `${issue.path.join(".")}: ${issue.message}`,
                        )
                        .join(", "),
                    400,
                );
            }

            next(error);
        }
    }