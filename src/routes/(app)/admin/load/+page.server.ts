import type { PageServerLoad } from "./$types";
import { TcgApiSetProvider } from "$lib/providers/tcgApiSetProvider";
import { TcgApiCardProvider } from "$lib/providers/tcgApiCardProvider";
import Database from "better-sqlite3";
import _ from "lodash";

export const load = (async ({ locals }) => {
    return;
    console.log("Current directory:", process.cwd());
    // let db = await new sqlite3.Database("src/data.db", sqlite3.OPEN_READONLY);
    const db = new Database("src/data.db");

    let sql = `SELECT
    c.name as collection_name,
    tac.card_id,
    cc.owned,
    cc.owned_variation
    FROM
    collection c
    left JOIN
    collection_card cc
    on c.id = cc.collection
    left join tcg_api_cards tac
    on cc.card = tac.id
    
    `;

    const stmt = db.prepare(sql);
    const oldCards = stmt.all();
    let i = 1;

    for (const oldCard of stmt.iterate()) {
        console.log(`Processing card ${i++} of ${oldCards.length}`);
        const cardSearch = await locals.db.collectionCard.findFirst({
            where: {
                collection: {
                    name: oldCard.collection_name,
                },
                tcgApiCard: {
                    tcgCardId: oldCard.card_id,
                },
            },
        });
        const collection = await locals.db.collection.findFirst({
            where: {
                name: oldCard.collection_name,
            },
        });
        const tcgApiCard = await locals.db.tcgApiCard.findFirst({
            where: {
                tcgCardId: oldCard.card_id,
            },
        });

        if (!cardSearch && collection && tcgApiCard) {
            const data = {
                tcgApiCardId: tcgApiCard.id,
                owned: oldCard.owned == 1,
                ownedVariation: oldCard.owned_variation == 1,
                index: 1,
                awaitingOwnership: false,
                awaitingOwnershipVariation: false,
                collectionId: collection.id,
            };
            // debugger;
            await locals.db.collectionCard.create({
                data,
            });
        }
    }

    // const pb_collections = db.all(sql, [], (err, rows) => {
    //     if (err) {
    //         throw err;
    //     }
    //     rows.forEach((row: any) => {
    //         return;
    //         Promise.all([
    //             locals.db.collectionCard.findFirst({
    //                 where: {
    //                     collection: {
    //                         name: row.collection_name,
    //                     },
    //                     tcgApiCard: {
    //                         tcgCardId: row.card_id,
    //                     },
    //                 },
    //             }),
    //             locals.db.collection.findFirst({
    //                 where: {
    //                     name: row.collection_name,
    //                 },
    //             }),
    //         ]).then(([collectionCard, collection]) => {
    //             // debugger;
    //             if (!collectionCard && collection) {
    //                 // debugger;
    //                 locals.db.collectionCard.create({
    //                     data: {
    //                         tcgApiCardId: row.card_id,
    //                         owned: row.owned == 1,
    //                         ownedVariation: row.owned_variation == 1,
    //                         index: 1,
    //                         awaitingOwnership: false,
    //                         awaitingOwnershipVariation: false,
    //                         collectionId: collection.id,
    //                     },
    //                 });
    //             }
    //         });
    //     });
    // });
}) satisfies PageServerLoad;
