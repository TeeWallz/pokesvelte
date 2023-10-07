import { getEnhancedPrisma } from "$lib/prisma";
import type { AdapterUser } from "@auth/core/adapters";
import type { User } from "@auth/core/types";
import { type PrismaClient, type Prisma, SpaceUserRole } from "@prisma/client";
import type { DefaultArgs } from "@prisma/client/runtime/library";
import { nanoid } from "nanoid";

export async function createAppUser(
    prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,
    user: AdapterUser | User
) {
    prisma = getEnhancedPrisma(user.id);
    const spaceUser = await prisma.spaceUser.findFirst({
        where: { userId: user.id },
    });

    if (spaceUser) {
        console.log("Space user already exists for user:", spaceUser);
        return;
    }

    const spaceUserName = user.name ? `${user.name}'s` : "My";
    const space = await prisma.space.create({
        data: {
            name: `${spaceUserName} Space`,
            slug: nanoid(8),
            members: {
                create: {
                    user: { connect: { id: user.id } },
                    role: SpaceUserRole.ADMIN,
                },
            },
        },
    });
    console.log("Space created for user:", space);
}
