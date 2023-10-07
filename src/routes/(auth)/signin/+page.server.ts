import { redirect, type RequestEvent } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async (event: RequestEvent) => {
    if (event.locals.user) {
        throw redirect(303, "/");
    }
};
