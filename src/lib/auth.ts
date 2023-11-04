import { getEnhancedPrisma } from "$lib/prisma";
import type { AdapterUser } from "@auth/core/adapters";
import type { User } from "@auth/core/types";
import { type PrismaClient, type Prisma, SpaceUserRole } from "@prisma/client";
import type { DefaultArgs } from "@prisma/client/runtime/library";
import { nanoid } from "nanoid";
import CredentialsProvider, {
    type CredentialsConfig,
} from "@auth/core/providers/credentials";
import bcrypt, { compare } from "bcryptjs";
import { fail } from "@sveltejs/kit";
import { env } from "$env/dynamic/private";
import jwt from "jsonwebtoken";
import type { Provider } from "@auth/core/providers";

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

export function createToken(user: User) {
    return jwt.sign(
        {
            sub: user.id,
            email: user.email,
        },
        env.JWT_SECRET,
        { expiresIn: "7d" }
    );
}

export function prismaAuthorize(prisma: PrismaClient) {
    return async (
        credentials: Partial<Record<"email" | "password", unknown>>,
        request: Request
    ) => {
        if (!credentials) throw new Error("Missing credentials");
        if (!credentials.email)
            throw new Error('"email" is required in credentials');
        if (!credentials.password)
            throw new Error('"password" is required in credentials');

        const maybeUser = await prisma.user.findFirst({
            where: { email: credentials.email },
            select: { id: true, email: true, password: true },
        });

        if (!maybeUser || !maybeUser.password) {
            console.log("No user found with email:", credentials.email);
            return null;
        }

        const isValid = await compare(
            credentials.password as string,
            maybeUser.password
        );
        if (!isValid) {
            console.log("Invalid password for user:", {
                ...maybeUser,
                password: undefined,
            });
            return null;
        }

        const returnUser = {
            id: maybeUser.id,
            email: maybeUser.email,
        };
        return returnUser;
    };
}
