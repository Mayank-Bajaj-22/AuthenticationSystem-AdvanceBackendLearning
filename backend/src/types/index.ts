export type ApiResponse<T> = {
    success: boolean;
    message: string;
    data?: T;
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
