import { User } from "../../../generated/prisma/index.js";

export interface IAdminRepository {
    getAllUsers(): Promise<User[]>;
}