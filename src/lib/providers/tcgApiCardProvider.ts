import type { PrismaClient } from "@prisma/client";
import { PokemonTCG } from "pokemon-tcg-sdk-typescript";
import _ from "lodash";

export class TcgApiCardProvider {
    private prisma: PrismaClient;

    constructor(prisma: PrismaClient) {
        this.prisma = prisma;
    }

    public async getCardsForSetsNeedingUpdate(count: number = 1) {
        console.log("Downloading cards from TCG API for sets needing update");
        const tcgApiSets = await this.prisma.tcgApiSet.findMany({
            where: {
                requiresCardUpdate: true,
            },
            orderBy: { releaseDate: "asc" },
            take: count,
        });

        console.log(`Downloading ${tcgApiSets.length} sets`);
        let firstRun = true;

        for (let i = 0; i < tcgApiSets.length; i++) {
            const tcgApiSet = tcgApiSets[i];
            const prefix = `[${i + 1}/${tcgApiSets.length}]`;
            console.log(
                `${prefix} Downloading cards from TCG API for set ${tcgApiSet.tcgSetId}`
            );
            await this.getCardsForSet(tcgApiSet.tcgSetId, prefix);
            await this.prisma.tcgApiSet.update({
                where: {
                    id: tcgApiSet.id,
                },
                data: {
                    requiresCardUpdate: false,
                },
            });

            if (firstRun) {
                firstRun = false;
            } else {
                await new Promise((r) => setTimeout(r, 5000));
            }
        }
        console.log("Completed downloading sets. Finishing.");
    }

    public async getCardsForSet(setId: string, prefix: string = "") {
        const tcgApiSets = await this.prisma.tcgApiSet.findMany({});

        const remoteCards = await PokemonTCG.findCardsByQueries({
            q: `set.id:${setId}`,
            orderBy: "releaseDate",
            pageSize: 1000,
        });

        for (const remoteCard of remoteCards) {
            const setId = tcgApiSets.find(
                (s) => s.tcgSetId === remoteCard.set.id
            )?.id;

            if (!setId) {
                throw new Error(`Set ${remoteCard.set.id} not found`);
            }

            const tcgApiCard = {
                tcgCardId: remoteCard.id,
                tcgSetId: remoteCard.set.id,
                name: remoteCard.name,
                supertype: remoteCard.supertype,
                subtypes: remoteCard.subtypes,
                hp: remoteCard.hp ?? "",
                types: remoteCard.types,
                evolvesFrom: remoteCard.evolvesFrom ?? "",
                rules: remoteCard.rules,
                attacks: remoteCard.attacks as any,
                weaknesses: remoteCard.weaknesses as any,
                resistances: remoteCard.resistances as any,
                retreatCost: remoteCard.retreatCost as any,
                convertedRetreatCost: remoteCard.convertedRetreatCost as any,
                number: remoteCard.number,
                artist: remoteCard.artist as any,
                rarity: remoteCard.rarity,
                nationalPokedexNumbers:
                    remoteCard.nationalPokedexNumbers as any,
                legalities: remoteCard.legalities as any,
                images: remoteCard.images as {},
                ancientTrait: remoteCard.ancientTrait as {},
                flavorText: remoteCard.flavorText as any,
                setId: setId,
            };

            console.log(`${prefix} Upserting card ${tcgApiCard.tcgCardId}`);

            await this.prisma.tcgApiCard.upsert({
                where: {
                    tcgCardId: remoteCard.id,
                },
                update: tcgApiCard,
                create: tcgApiCard,
            });
        }

        console.log(`${prefix} Completed downloading cards for set ${setId}.`);
    }
}
