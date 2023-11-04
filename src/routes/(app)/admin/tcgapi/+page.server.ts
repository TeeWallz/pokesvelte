import type { PageServerLoad } from "./$types";
import { TcgApiSetProvider } from "$lib/providers/tcgApiSetProvider";
import { TcgApiCardProvider } from "$lib/providers/tcgApiCardProvider";

export const load = (async ({ locals }) => {
    const tcgApiSets = await locals.db.tcgApiSet.findMany({
        orderBy: { releaseDate: "asc" },
    });
    return { user: locals.user!, tcgApiSets };
}) satisfies PageServerLoad;

export const actions = {
    getTcgSets: async ({ locals }) => {
        const tcgApiSetProvider = new TcgApiSetProvider(locals.db);
        await tcgApiSetProvider.getSets();

        const tcgApiSets = await locals.db.tcgApiSet.findMany({
            orderBy: { releaseDate: "desc" },
        });
        return { user: locals.user!, tcgApiSets };
    },

    getTcgCards: async ({ locals }) => {
        const tcgApiCardProvider = new TcgApiCardProvider(locals.db);
        await tcgApiCardProvider.getCardsForSetsNeedingUpdate();

        const tcgApiSets = await locals.db.tcgApiSet.findMany({
            orderBy: { releaseDate: "desc" },
        });
        return { user: locals.user!, tcgApiSets };
    },
};
