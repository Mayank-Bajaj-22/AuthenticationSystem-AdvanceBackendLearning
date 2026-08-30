import { User, Session, RefreshToken } from "../../../generated/prisma/index.js";
import { CreateRefreshTokenType, CreateSessionType, CreateUserType, FindUserByIdType, SessionWithRefreshTokensType } from "./auth.types.js";

export interface IAuthRepository {
    findUserByEmail(email: string) : Promise<User | null>;
    findUserById(userId: string) : Promise<FindUserByIdType | null>;
    createUser(data: CreateUserType) : Promise<User>;
    createSession(data: CreateSessionType) : Promise<Session>;
    createRefreshToken(data: CreateRefreshTokenType) : Promise<RefreshToken>;
    findRefreshTokenById(id: string) : Promise<RefreshToken | null>;
    revokeRefreshToken(
        tokenId: string,
        replacedById?: string,
    ) : Promise<void>;
    revokeTokenFamily(familyId: string) : Promise<void>;
    rotateRefreshToken(
        oldTokenId: string,
        newToken: CreateRefreshTokenType,
    ) : Promise<void>;
    findSessionById(sessionId: string) : Promise<SessionWithRefreshTokensType | null>;
    revokeSession(sessionId: string) : Promise<void>;
    revokeAllUserSessions(userId: string) : Promise<void>;
}