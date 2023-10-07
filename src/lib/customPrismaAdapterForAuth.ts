import { createAppUser } from "$lib/auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import type { PrismaClient, Prisma } from "@prisma/client";
import type { DefaultArgs } from "@prisma/client/runtime/library";

export default function CustomPrismaAdapterForAuth(
    prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
) {
    const adapter = PrismaAdapter(prisma);
    // Piggy back off adapter.createUser to create app user on user creation
    // https://github.com/nextauthjs/next-auth/blob/c21e9b94f52d8c623adc8f288a81706f383afe56/packages/adapter-prisma/src/index.ts#L223
    //@ts-ignore
    adapter.createUser = async (data) => {
        const user = await prisma.user.create({ data });
        await createAppUser(prisma, user);
        return user;
    };
    return adapter;
}
