import { Permissions } from "../../constants/permissions.js";
import { AppError } from "../../utils/common/errors/AppError.js";
import { IAuthorizationRepository } from "./authorization.interface.js";

export class AuthorizationService {
    constructor(
        private readonly authorizationRepository: IAuthorizationRepository,
    ) {}

    async getUserPermissions(
        userId: string,
    ) : Promise<Permissions[]> {
        const authorizationData = 
            await this.authorizationRepository.getUserAuthorizationData(
                userId,
            );

        if (!authorizationData) {
            throw new AppError(
                "User not found",
                404,
            );
        }

        return authorizationData.permissions;
    }

    async hasPermissions(
        userId: string,
        requiredPermissions: Permissions[],
    ) : Promise<boolean> {
        const userPermissions = 
            await this.getUserPermissions(userId);

        return requiredPermissions.every(
            (requiredPermission) => userPermissions.includes(requiredPermission),
        );
    }

    async authorize(
        userId: string,
        requiredPermissions: Permissions[],
    ) : Promise<void> {
        const hasRequiredPermissions =
            await this.hasPermissions(
                userId,
                requiredPermissions,
            );
        
        if (!hasRequiredPermissions) {
            throw new AppError(
                "You do not have permission to perform this action",
                403,
            );
        }
    }
};