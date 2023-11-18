import type { CollectionCard } from "@prisma/client";
import type { PageServerLoad } from "./$types";
import { COLLECTION_CARD_QUERY } from "$lib/queryJson";

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

    const collectionCards = await locals.db.collectionCard.findMany(
        COLLECTION_CARD_QUERY
    );

    return { user: locals.user!, collectionCards, initialCardQuery };
}) satisfies PageServerLoad;
