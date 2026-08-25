import { Session, User } from "../../../generated/prisma/index.js";
import { prisma } from "../../lib/prisma.js";
import { IAuthRepository } from "./auth.interface.js";
import { CreateSessionType, CreateUserType, FindUserByIdType } from "./auth.types.js";

export class AuthRepository implements IAuthRepository {
    async findUserByEmail(
        email: string
    ): Promise<User | null> {
        const user = await prisma.user.findUnique({
            where: {
                email,
            },
        });

        return user;
    }

    async createUser(
        data: CreateUserType
    ): Promise<User> {
        const createdUser = await prisma.user.create({
            data: {
                email: data.email,
                passwordHash: data.hashedPassword,
            },
        });

        return createdUser;
    }

    async createSession(
        data: CreateSessionType
    ): Promise<Session> {
        const newSession = await prisma.session.create({
            data,
        });

        return newSession;
    }

    async findUserById(
        userId: string
    ): Promise<FindUserByIdType | null> {
        const user = await prisma.user.findUnique({
            where: {
                id: userId,
            },
            select: {
                id: true,
                email: true,
                createdAt: true,
            },
        });

        return user;
    }
}