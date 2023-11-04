import prisma, { getEnhancedPrisma } from "$lib/prisma";
import type { Handle } from "@sveltejs/kit";
import { sequence } from "@sveltejs/kit/hooks";
import zenstack from "@zenstackhq/server/sveltekit";
import { SvelteKitAuth } from "@auth/sveltekit";
import GitHub from "@auth/core/providers/github";
import CredentialsProvider from "@auth/core/providers/credentials";
import { GITHUB_ID, GITHUB_SECRET } from "$env/static/private";
import { createAppUser, prismaAuthorize } from "$lib/auth";
import CustomPrismaAdapterForAuth from "$lib/customPrismaAdapterForAuth";
import { createJobs } from "$lib/jobs";
import type { PrismaClient, Prisma } from "@prisma/client";
import type { DefaultArgs } from "@prisma/client/runtime/library";
import type { Provider } from "@auth/core/providers";
import { encode, decode } from "@auth/core/jwt";

createJobs(getEnhancedPrisma());

const auth = SvelteKitAuth({
    providers: [
        GitHub({
            clientId: GITHUB_ID,
            clientSecret: GITHUB_SECRET,
            // allowDangerousEmailAccountLinking: true,
        }),
        // CredentialsProvider({
        //     credentials: {
        //         email: {
        //             label: "Email Address",
        //             type: "email",
        //         },
        //         password: {
        //             label: "Password",
        //             type: "password",
        //         },
        //     },

        //     authorize: prismaAuthorize(prisma),
        // }),
    ],
    adapter: CustomPrismaAdapterForAuth(prisma),
    jwt: { encode, decode },
    session: {
        strategy: "jwt",
    },
    // async encode(event) {
    //     if (!event.token) {
    //         return "";
    //     }

    //     const payload = {
    //         sub: event.token.sub,
    //         email: event.token.email,
    //     };
    //     //@ts-ignore
    //     const kek = await event!.encode(payload);
    //     debugger;
    //     // const kek = event.encode(event.tp)
    //     // return jwt.sign(
    //     //     {
    //     //         sub: event.id,
    //     //         email: event.email,
    //     //     },
    //     //     env.JWT_SECRET,
    //     //     { expiresIn: "7d" }
    //     // )
    //     return "";
    // },
    // async decode(all) {
    //     debugger;
    //     const kek = jwt.verify(token!, process.env.JWT_SECRET!) as JWT;
    //     debugger;
    //     return kek;
    // },
    callbacks: {
        async signIn(event) {
            if (event.user) {
                createAppUser(prisma, event.user);
            }
            return true;
        },
        async session(event) {
            if (event.token) {
                //@ts-ignore
                event.session.user.id = event.token.sub;
                //@ts-ignore
            } else if (event.session.user?.id) {
                //@ts-ignore
                event.session.user.id = event.user.id;
            }
            return event.session;
        },
        jwt: async ({ token, user }) => {
            user && (token.user = user);
            return token;
        },
    },
});

const enrichment = (async ({ event, resolve }) => {
    event.locals.session = await event.locals.getSession();
    event.locals.user = event.locals.session?.user;
    event.locals.db = getEnhancedPrisma(
        event.locals.user ? event.locals.user.id : undefined
    );
    return resolve(event);
}) satisfies Handle;

const crud = zenstack.SvelteKitHandler({
    prefix: "/api/model",
    getPrisma: (event) => event.locals.db,
});

export const handle = sequence(auth, enrichment, crud);
