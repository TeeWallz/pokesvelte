import validator from "validator";
import type { PageServerLoad } from "./$types";
import { fail } from "@sveltejs/kit";
import { getEnrichedCollections } from "$lib/queries";
import { get } from "lodash";
import { getPaginatedCollectionCards } from "$lib/queries/collectionCards";
import { COLLECTION_CARD_QUERY } from "$lib/queryJson";

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

    const additionalFilters = {
        where: { collectionId: `${collectionId}` },
    };
    const collectionCards = await arg.locals.db.collectionCard.findMany({
        ...COLLECTION_CARD_QUERY,
        ...additionalFilters,
    });

    const customSQLData = await arg.locals.db.$queryRaw`
        SELECT *, 
            ROW_NUMBER() OVER (PARTITION BY "collectionId" ORDER BY "releaseDate" ASC, "number" ASC) as postgres_rank
        FROM "CollectionCard"
        WHERE "collectionId" IN (
            SELECT "id" FROM "Collection" ORDER BY "createdAt" DESC LIMIT 9
        )
        ORDER BY "releaseDate" ASC, "number" ASC
    `;

    const binderPageSize = 9;

    const combinedResult = collectionCards.map((prismaItem, index) => {
        const postgresRank = customSQLData[index].postgres_rank;
        const page = Math.floor((postgresRank - 1) / binderPageSize) + 1;
        const slot = ((postgresRank - 1) % binderPageSize) + 1;

        return {
            ...prismaItem,
            postgresRank,
            page,
            slot,
        };
    });

    console.log(combinedResult);

    return {
        collection: collection[0],
        collectionCards,
    };
}) satisfies PageServerLoad;
