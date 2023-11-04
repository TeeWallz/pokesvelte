import type { CollectionCard } from "@prisma/client";
import type { PageServerLoad } from "./$types";

export const load = (async ({ locals }) => {
    const initialCardQuery = {
        include: {
            tcgApiCard: {
                include: {
                    set: true,
                },
            },
        },
        orderBy: [
            {
                tcgApiCard: {
                    set: {
                        releaseDate: "asc",
                    },
                },
            },
            {
                tcgApiCard: {
                    number: "asc",
                },
            },
        ],
    };

    const collectionCards: CollectionCard[] =
        await locals.db.collectionCard.findMany({
            ...initialCardQuery,
            ...{ take: 9 },
        });
    return { user: locals.user!, collectionCards, initialCardQuery };
}) satisfies PageServerLoad;
