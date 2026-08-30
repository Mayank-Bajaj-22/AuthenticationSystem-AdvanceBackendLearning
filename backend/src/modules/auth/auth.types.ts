export type CreateUserType = {
    email: string;
    hashedPassword: string | null;
}

export type CreateSessionType = {
    id: string;
    userId: string;
    deviceName?: string;
    userAgent?: string;
    ipAddress?: string;
    expiresAt: Date;
};

export type UserType = {
    userId: string;
    sessionId: string;
};

export type FindUserByIdType = {
    id: string;
    email: string;
    createdAt: Date;
}

export type CreateRefreshTokenType = {
    id: string;
    sessionId: string;
    tokenHash: string;
    familyId: string;
    expiresAt: Date;
};

export type AccessTokenPayload = {
    sub: string;
    sessionId: string;
    type: "access";
};

export type RefreshTokenPayload = {
    sub: string;
    sessionId: string;
    tokenId: string;
    familyId: string;
    type: "refresh";
};

export type SessionWithRefreshTokensType = {
    id: string;
    userId: string;
    expiresAt: Date;
    revokedAt: Date | null;
    refreshTokens: {
        id: string;
        revokedAt: Date | null;
    }[];
};