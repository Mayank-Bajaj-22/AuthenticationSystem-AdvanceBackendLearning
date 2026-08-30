import { prisma } from "../../lib/prisma.js";
import { IAuthorizationRepository } from "./authorization.interface.js";
import { UserAuthorizationData } from "./authorization.types.js";
import { Permissions } from "../../constants/permissions.js";

export class AuthorizationRepository
    implements IAuthorizationRepository
{
    async getUserAuthorizationData(
        userId: string,
    ): Promise<UserAuthorizationData | null> {
        const user = await prisma.user.findUnique({
            where: {
                id: userId,
            },

            select: {
                id: true,

                userRoles: {
                    where: {
                        role: {
                            deletedAt: null,
                        },
                    },

                    select: {
                        role: {
                            select: {
                                rolePermissions: {
                                    select: {
                                        permission: {
                                            select: {
                                                name: true,
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });

        if (!user) {
            return null;
        }

        const permissions = user.userRoles.flatMap(
            (userRole) =>
                userRole.role.rolePermissions.map(
                    (rolePermission) =>
                        rolePermission.permission.name as Permissions,
                ),
        );

        const uniquePermissions = [
            ...new Set(permissions),
        ];

        return {
            userId: user.id,
            permissions: uniquePermissions,
        };
    }
}