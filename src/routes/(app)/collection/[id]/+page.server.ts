import validator from "validator";
import type { PageServerLoad } from "./$types";
import { fail } from "@sveltejs/kit";
import { getEnrichedCollections } from "$lib/queries";

export const load = (async ({ locals, params }) => {
    let collectionId = params.id;
    if (
        typeof collectionId !== "string" ||
        collectionId === "" ||
        !validator.isUUID(collectionId)
    ) {
        return fail(400, { collectionId: { missing: true } });
    }

    const collection = await getEnrichedCollections(locals.db, params.id);

    if (collection.length === 0) {
        return fail(404, { collection: { notFound: true } });
    }

    const collectionCards = await locals.db.collectionCard.findMany({
        where: {
            collectionId: params.id,
        },
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
    });

    return {
        collection: collection[0],
        collectionCards,
    };
}) satisfies PageServerLoad;
