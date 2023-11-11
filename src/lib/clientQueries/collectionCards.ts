import { useFindManyCollectionCard } from "$lib/hooks";
import type { CollectionCard, PrismaClient } from "@prisma/client";

export interface PaginatedResponse<T> {
    data: T[];
    page: number;
    pageTotal: number;
    total: number;
    pageSize: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}

function getPaginationQueryParams(page: number, pageSize: number) {
    return {
        skip: (page - 1) * pageSize,
        take: pageSize,
    };
}

export async function getPaginatedCollectionCards(
    page: number,
    pageSize: number,
    db: PrismaClient
): Promise<PaginatedResponse<CollectionCard>> {
    const paginationQueryParams = getPaginationQueryParams(page, pageSize);
    const collectionCardsQuery = useFindManyCollectionCard({
        ...paginationQueryParams,
        ...{
            include: {
                tcgApiCard: {
                    include: {
                        set: true,
                    },
                },
            },
            orderBy: [
                { tcgApiCard: { set: { releaseDate: "asc" } } },
                { tcgApiCard: { number: "asc" } },
            ],
        },
    });

    const total = await db.collectionCard.count();
    const pageTotal = Math.ceil(total / pageSize);
    return {
        data: collectionCards,
        page,
        pageTotal,
        total,
        pageSize,
        hasNextPage: page * pageSize < total,
        hasPreviousPage: page > 1,
    };
}
