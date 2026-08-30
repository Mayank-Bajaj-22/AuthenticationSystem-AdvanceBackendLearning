import { RefreshToken, Session, User } from "../../../generated/prisma/index.js";
import { prisma } from "../../lib/prisma.js";
import { IAuthRepository } from "./auth.interface.js";
import { CreateRefreshTokenType, CreateSessionType, CreateUserType, FindUserByIdType, SessionWithRefreshTokensType } from "./auth.types.js";

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

    async createRefreshToken(
        data: CreateRefreshTokenType
    ): Promise<RefreshToken> {
        const createdRefreshToken = await prisma.refreshToken.create({
            data,
        });

        return createdRefreshToken;
    }

    async findRefreshTokenById(
        id: string
    ): Promise<RefreshToken | null> {
        const refreshToken = await prisma.refreshToken.findUnique({
            where: {
                id,
            },
        });

        return refreshToken;
    }

    async revokeRefreshToken(
        tokenId: string, 
        replacedById?: string
    ): Promise<void> {
        await prisma.refreshToken.update({
            where: {
                id: tokenId,
            },
            data: {
                revokedAt: new Date(),
                replacedById,
            },
        });
    }

    async revokeTokenFamily(
        familyId: string
    ): Promise<void> {
        await prisma.refreshToken.updateMany({
            where: {
                familyId,
                revokedAt: null,
            },
            data: {
                revokedAt: new Date(),
            },
        });
    }

    async rotateRefreshToken(
        oldTokenId: string, 
        newToken: CreateRefreshTokenType
    ): Promise<void> {
        await prisma.$transaction(async (tx) => {
            const revoked = await tx.refreshToken.updateMany({
                where: {
                    id: oldTokenId,
                    revokedAt: null,
                },
                data: {
                    revokedAt: new Date(),
                    replacedById: newToken.id,
                },
            });

            if (revoked.count !== 1) {
                throw new Error(
                    "Refresh token has already been revoked",
                );
            }

            await tx.refreshToken.create({
                data: newToken,
            });
        });
    }

    async findSessionById(
        sessionId: string
    ): Promise<SessionWithRefreshTokensType | null> {
        return prisma.session.findUnique({
            where: {
                id: sessionId,
            },
            select: {
                id: true,
                userId: true,
                expiresAt: true,
                revokedAt: true,
                refreshTokens: {
                    select: {
                        id: true,
                        revokedAt: true,
                    },
                },
            },
        });
    }

    async revokeSession(
        sessionId: string
    ): Promise<void> {
        const now = new Date();

        await prisma.$transaction([
            // revoke session
            prisma.session.update({
                where: {
                    id: sessionId,
                },
                data: {
                    revokedAt: now,
                },
            }),

            // revoke all refresh tokens belonging to this session
            prisma.refreshToken.updateMany({
                where: {
                    sessionId,
                    revokedAt: null,
                },
                data: {
                    revokedAt: now,
                },
            }),
        ]);
    }

    async revokeAllUserSessions(
        userId: string
    ): Promise<void> {
        const now = new Date();

        await prisma.$transaction([
            // revoke all sessions
            prisma.session.updateMany({
                where: {
                    userId,
                    revokedAt: null,
                },
                data: {
                    revokedAt: now,
                },
            }),

            // revoke all refresh tokens belonging to user sessions
            prisma.refreshToken.updateMany({
                where: {
                    session: {
                        userId,
                    },
                    revokedAt: null,
                },
                data: {
                    revokedAt: now,
                },
            }),
        ]);
    }
}