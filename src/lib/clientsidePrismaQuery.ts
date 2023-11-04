import { useFindManyCollection } from "$lib/hooks";

export async function getCollectionEnriched(where: any = {}) {
    const collections = await useFindManyCollection({
        where,
        include: {
            collectionCards: true, // Include related CollectionCards
        },
    });

    let result: any = [];
    // Calculate totalCollectionCards and collectedCollectionCards for each collection
    collections.subscribe((collections) => {
        if (!collections.data) return [];

        result = collections.data.map((collection) => {
            const totalCollectionCards = collection.collectionCards.length;
            const collectedCollectionCards = collection.collectionCards.filter(
                (card) => card.collected === true
            ).length;

            return {
                ...collection,
                totalCollectionCards,
                collectedCollectionCards,
            };
        });
    });
    return result;
}
