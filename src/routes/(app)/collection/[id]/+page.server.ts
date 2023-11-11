import validator from "validator";
import type { PageServerLoad } from "./$types";
import { fail } from "@sveltejs/kit";
import { getEnrichedCollections } from "$lib/queries";
import { get } from "lodash";
import { getPaginatedCollectionCards } from "$lib/queries/collectionCards";

export const load = (async (arg) => {
    let collectionId = arg.params.id;
    if (
        typeof collectionId !== "string" ||
        collectionId === "" ||
        !validator.isUUID(collectionId)
    ) {
        return fail(400, { collectionId: { missing: true } });
    }
    const collection = await getEnrichedCollections(
        arg.locals.db,
        arg.params.id
    );

    if (collection.length === 0)
        return fail(404, { collection: { notFound: true } });

    const page = parseInt(arg.url.searchParams.get("page") || "1");
    console.log("page", page);

    const collectionCards = await getPaginatedCollectionCards(
        parseInt(arg.url.searchParams.get("page") || "1"),
        parseInt(arg.url.searchParams.get("pageSize") || "9"),
        arg.locals.db
    );

    return {
        collection: collection[0],
        collectionCards,
    };
}) satisfies PageServerLoad;
