import { SpaceUserRole, type Space } from "@prisma/client";
import { fail, type Actions, json, redirect } from "@sveltejs/kit";
import { isPrismaClientKnownRequestError } from "@zenstackhq/runtime";
import { PokemonTCG } from "pokemon-tcg-sdk-typescript";
import {
    useCreateCollection,
    useCreateCollectionCard,
    useFindManyTcgApiCard,
} from "$lib/hooks";

const serializeNonPOJOs = (value: object | null) => {
    return JSON.parse(JSON.stringify(value));
};

export const actions = {
    tcgApiGetCards: async ({ request, locals }) => {
        const data = await request.formData();
        const filterString = data.get("filter");

        if (typeof filterString !== "string" || filterString === "") {
            return fail(400, { filter: { missing: true } });
        }
        const filter = {
            q: filterString,
            orderBy: "set.releaseDate",
        };
        const cards = await PokemonTCG.findCardsByQueries(filter);
        // return { cards };
        return { cards };
    },

    createCollection: async ({ request, locals }) => {
        const user = locals.user;
        const data = await request.formData();
        const name = data.get("name");
        const filter = data.get("filter");
        const cards = data.get("cards");

        if (!user) {
            return fail(401, { user: { missing: true } });
        }
        if (typeof name !== "string" || name === "") {
            return fail(400, { name: { missing: true } });
        }
        if (typeof filter !== "string" || filter === "") {
            return fail(400, { filter: { missing: true } });
        }
        if (typeof cards !== "string" || cards === "") {
            return fail(400, { cards: { missing: true } });
        }
        const parsedCards = JSON.parse(cards);
        const tcgApiCards = await locals.db.tcgApiCard.findMany({
            where: {
                tcgCardId: {
                    in: parsedCards,
                },
            },
            orderBy: {
                set: {
                    releaseDate: "asc",
                },
            },
        });

        const collection = await locals.db.collection.create({
            data: {
                name,
                ownerId: user.id,
                cardApiOrderBy: "set.releaseDate",
                cardSort: "set.releaseDate",
                collecting_variations: true,
                tcgApiFilter: filter,
                collectionCards: {
                    create: tcgApiCards.map((card) => ({
                        tcgApiCardId: card.id,
                        index: 0,
                        owned: false,
                        ownedVariation: false,
                        awaitingOwnership: false,
                        awaitingOwnershipVariation: false,
                    })),
                },
            },
            include: {
                collectionCards: {},
            },
        });

        debugger;
    },
} satisfies Actions;
