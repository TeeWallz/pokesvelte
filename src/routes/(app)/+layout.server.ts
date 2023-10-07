import { redirect } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";
import type { RequestEvent } from "@sveltejs/kit";

export const load: LayoutServerLoad = async (event: RequestEvent) => {
    const session = await event.locals.getSession();
    if (!session?.user) {
        throw redirect(303, "/signin");
    }
    return {
        session,
    };
};
