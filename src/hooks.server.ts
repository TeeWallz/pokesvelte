import prisma, { getEnhancedPrisma } from "$lib/prisma";
import type { Handle } from "@sveltejs/kit";
import { sequence } from "@sveltejs/kit/hooks";
import zenstack from "@zenstackhq/server/sveltekit";
import { SvelteKitAuth } from "@auth/sveltekit";
import GitHub from "@auth/core/providers/github";
import { GITHUB_ID, GITHUB_SECRET } from "$env/static/private";
import { createAppUser } from "$lib/auth";
import CustomPrismaAdapterForAuth from "$lib/customPrismaAdapterForAuth";

const auth = SvelteKitAuth({
    providers: [GitHub({ clientId: GITHUB_ID, clientSecret: GITHUB_SECRET })],
    adapter: CustomPrismaAdapterForAuth(prisma),
    callbacks: {
        async signIn(event) {
            if (event.user) {
                createAppUser(prisma, event.user);
            }
            return true;
        },
        async session(event) {
            if (event.session.user) {
                //@ts-ignore
                event.session.user.id = event.user.id;
            }
            return event.session;
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
