import { User } from "../../../generated/prisma/index.js";
import { prisma } from "../../lib/prisma.js";
import { IAdminRepository } from "./admin.interface.js";

export class AdminReposiotry implements IAdminRepository {
    async getAllUsers(): Promise<User[]> {
        const users = await prisma.user.findMany();

        return users;
    }
}