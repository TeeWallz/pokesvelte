import type { PageServerLoad } from "./$types";
import { TcgApiSetProvider } from "$lib/providers/tcgApiSetProvider";
import { TcgApiCardProvider } from "$lib/providers/tcgApiCardProvider";
import sqlite3 from "sqlite3";
import _ from "lodash";

export const load = (async ({ locals }) => {
    console.log("Current directory:", process.cwd());
    let db = await new sqlite3.Database("src/data.db", sqlite3.OPEN_READONLY);

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

    const pb_collections = db.all(sql, [], (err, rows) => {
        if (err) {
            throw err;
        }
        rows.forEach((row: any) => {
            Promise.all([
                locals.db.collectionCard.findFirst({
                    where: {
                        collection: {
                            name: row.collection_name,
                        },
                        tcgApiCard: {
                            tcgCardId: row.card_id,
                        },
                    },
                }),
                locals.db.collection.findFirst({
                    where: {
                        name: row.collection_name,
                    },
                }),
            ]).then(([collectionCard, collection]) => {
                // debugger;
                if (!collectionCard && collection) {
                    // debugger;
                    locals.db.collectionCard.create({
                        data: {
                            tcgApiCardId: row.card_id,
                            owned: row.owned == 1,
                            ownedVariation: row.owned_variation == 1,
                            index: 1,
                            awaitingOwnership: false,
                            awaitingOwnershipVariation: false,
                            collectionId: collection.id,
                        },
                    });
                }
            });
        });
    });
}) satisfies PageServerLoad;
