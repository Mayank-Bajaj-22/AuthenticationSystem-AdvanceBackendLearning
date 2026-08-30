import { UserAuthorizationData } from "./authorization.types.js";

export interface IAuthorizationRepository {
    getUserAuthorizationData(userId: string) : Promise<UserAuthorizationData | null>;
}