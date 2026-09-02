import { env } from "../src/config/env.config.js";
import { Permissions } from "../src/constants/permissions.js";
import { prisma } from "../src/lib/prisma.js";
import { hashPassword } from "../src/utils/auth/password.js";

async function main() {
    console.log("Starting database seed...");

    // 1. Create permissions

    const permissions = [
        Permissions.MANAGE_USERS,
        Permissions.DELETE_POSTS,
        Permissions.VIEW_ANALYTICS,
        Permissions.MANAGE_ROLES,
    ];

    for (const permission of permissions) {
        await prisma.permission.upsert({
            where: {
                name: permission,
            },

            update: {},

            create: {
                name: permission,
            },
        });
    }

    console.log("Permissions seeded");

    // 2. Create ADMIN role

    const adminRole = await prisma.role.upsert({
        where: {
            name: "ADMIN",
        },

        update: {},

        create: {
            name: "ADMIN",
            description: "System administrator",
            isSystem: true,
        },
    });

    console.log("Admin role ready");

    // 3. Fetch permissions

    const dbPermissions =
        await prisma.permission.findMany({
            where: {
                name: {
                    in: permissions,
                },
            },
        });

    // 4. Assign permissions to ADMIN

    for (const permission of dbPermissions) {
        await prisma.rolePermission.upsert({
            where: {
                roleId_permissionId: {
                    roleId: adminRole.id,
                    permissionId: permission.id,
                },
            },

            update: {},

            create: {
                roleId: adminRole.id,
                permissionId: permission.id,
            },
        });
    }

    console.log(
        "Admin permissions assigned",
    );

    // 5. Create initial admin user

    let adminUser =
        await prisma.user.findUnique({
            where: {
                email: env.ADMIN_EMAIL,
            },
        });

    if (!adminUser) {
        const hashedPassword =
            await hashPassword(
                env.ADMIN_PASSWORD,
            );

        adminUser =
            await prisma.user.create({
                data: {
                    email: env.ADMIN_EMAIL,
                    passwordHash: hashedPassword,
                    isEmailVerified: true,
                },
            });

        console.log(
            "Admin user created",
        );
    } else {
        console.log(
            "Admin user already exists",
        );
    }

    // 6. Assign ADMIN role

    await prisma.userRole.upsert({
        where: {
            userId_roleId: {
                userId: adminUser.id,
                roleId: adminRole.id,
            },
        },

        update: {},

        create: {
            userId: adminUser.id,
            roleId: adminRole.id,
        },
    });

    console.log(
        "Admin role assigned",
    );

    console.log(
        "Database seed completed successfully",
    );
}

main()
    .catch((error) => {
        console.error(
            "Seed failed:",
            error,
        );

        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });