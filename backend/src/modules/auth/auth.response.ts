import { User } from "../../../generated/prisma/index.js";

export const sanitizedUserResponse = (user: User) => {
    return {
        id: user.id,
        email: user.email,
        isEmailVerified: user.isEmailVerified,
        status: user.status,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    };
};