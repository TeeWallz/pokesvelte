export let COLLECTION_CARD_QUERY = {
    include: {
        tcgApiCard: {
            include: {
                set: true,
            },
        },
        collection: true,
    },
    orderBy: [
        { tcgApiCard: { set: { releaseDate: "asc" } } },
        { tcgApiCard: { number: "asc" } },
    ],
    take: 9,
};
