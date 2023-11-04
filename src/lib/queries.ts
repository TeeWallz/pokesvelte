import type { PrismaClient, Prisma } from "@prisma/client";
import type { DefaultArgs } from "@prisma/client/runtime/library";
import _ from "lodash";
import validator from "validator";

export interface CollectionSummary {
    id: string;
    name: string;
    ownerId: string;
    collecting_variations: boolean;
    tcgApiFilter: string;
    cardSort: string;
    cardApiOrderBy: string;
    cardTotal: number;
    ownedCount: number;
    ownedVariationCount: number;
    awaitingOwnershipCount: number;
    awaitingVariationCount: number;
}

export async function getEnrichedCollections(
    prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,
    collectionId: string | null = null
) {
    // if collectionId does not match uuid pattern, return empty array
    let filterPart = "";
    if (_.isNull(collectionId)) {
        filterPart = "";
    } else if (!validator.isUUID(collectionId)) {
        return [];
    } else {
        filterPart = `where c.id = '${collectionId}'`;
    }

    // const collections = await prisma.$queryRaw<CollectionSummary[]>`
    const collections = await prisma.$queryRawUnsafe<CollectionSummary[]>(
        `
            select
                c.id,
                c."name",
                c."ownerId" ,
                c.collecting_variations,
                c."tcgApiFilter",
                c."cardSort",
                c."cardApiOrderBy",
                COUNT(cc.id) as "cardTotal",
                cast(SUM(case when cc."owned" then 1 else 0 END) as int) as "ownedCount",
                cast(SUM(case when cc."ownedVariation" then 1 else 0 END) as int) as "ownedVariationCount",
                cast(SUM(case when cc."awaitingOwnership" then 1 else 0 END) as int) as "awaitingOwnershipCount",
                cast(SUM(case when cc."awaitingOwnershipVariation" then 1 else 0 END) as int) as "awaitingVariationCount"
            from 
                "pokemon_collection"."Collection" c 
                left join 
                    "pokemon_collection"."CollectionCard" cc 
                        on c.id = cc."collectionId" 
            ${filterPart}
            group by c.id;`
    );

    collections.forEach(
        (collection: {
            cardTotal: number;
            ownedCount: number;
            ownedVariationCount: number;
            awaitingOwnershipCount: number;
            awaitingVariationCount: number;
        }) => {
            collection.cardTotal = Number(collection.cardTotal);
            collection.ownedCount = Number(collection.ownedCount);
            collection.ownedVariationCount = Number(
                collection.ownedVariationCount
            );
            collection.awaitingOwnershipCount = Number(
                collection.awaitingOwnershipCount
            );
            collection.awaitingVariationCount = Number(
                collection.awaitingVariationCount
            );
        }
    );
    return collections;
}
