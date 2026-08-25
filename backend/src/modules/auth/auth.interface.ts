import { User, Session } from "../../../generated/prisma/index.js";
import { CreateSessionType, CreateUserType, FindUserByIdType } from "./auth.types.js";

export interface IAuthRepository {
    findUserByEmail(email: string) : Promise<User | null>;
    findUserById(userId: string) : Promise<FindUserByIdType | null>;
    createUser(data: CreateUserType) : Promise<User>;
    createSession(data: CreateSessionType) : Promise<Session>;
}