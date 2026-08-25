import { User, Session } from "../../../generated/prisma/index.js";
import { createSessionType, createUserType } from "./auth.types.js";

export interface IAuthRepository {
    findUserByEmail(email: string) : Promise<User | null>;
    createUser(data: createUserType) : Promise<User>;
    createSession(data: createSessionType) : Promise<Session>;
}