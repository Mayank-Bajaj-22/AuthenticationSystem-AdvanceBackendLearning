export type createUserType = {
    email: string;
    hashedPassword: string | null;
}

export type JWTPayload = {
    sub: string;
    sessionId: string;
};

export type createSessionType = {
    id: string;
    userId: string;
    refreshTokenHash: string;
    deviceName?: string;
    userAgent?: string;
    ipAddress?: string;
    expiresAt: Date;
};