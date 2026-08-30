import { Permissions } from "../../constants/permissions.js";

export type UserPermission = Permissions;

export type AuthorizationContext = {
    userId: string;
    sessionId: string;
};

export type UserAuthorizationData = {
    userId: string;
    permissions: UserPermission[];
};