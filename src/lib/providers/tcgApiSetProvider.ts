import type { PrismaClient } from "@prisma/client";
import { PokemonTCG } from "pokemon-tcg-sdk-typescript";
import _ from "lodash";

export class TcgApiSetProvider {
    private prisma: PrismaClient;

    constructor(prisma: PrismaClient) {
        this.prisma = prisma;
    }

    public async getSets() {
        console.log("Downloading sets from TCG API");
        const tcgApiSets = await this.prisma.tcgApiSet.findMany({
            orderBy: { releaseDate: "desc" },
        });

        const remoteSets = await PokemonTCG.findSetsByQueries({
            orderBy: "releaseDate",
            pageSize: 1000,
        });
        for (const remoteSet of remoteSets) {
            const localTcgSet = tcgApiSets.find(
                (s) => s.tcgSetId === remoteSet.id
            );

            const tcgApiSet = {
                tcgSetId: remoteSet.id,
                name: remoteSet.name,
                series: remoteSet.series,
                printedTotal: remoteSet.printedTotal,
                total: remoteSet.total,
                legalities: JSON.stringify(remoteSet.legalities),
                ptcgoCode: remoteSet.ptcgoCode,
                images: remoteSet.images as {},
                releaseDate: new Date(remoteSet.releaseDate),
                updatedAt: new Date(remoteSet.updatedAt),
                requiresCardUpdate: true,
            };

            console.log(`Upserting set ${remoteSet.name}`);

            if (
                !_.isEqual(
                    new Date(remoteSet.updatedAt),
                    localTcgSet?.updatedAt
                )
            ) {
                await this.prisma.tcgApiSet.upsert({
                    where: {
                        tcgSetId: remoteSet.id,
                    },
                    update: tcgApiSet,
                    create: tcgApiSet,
                });
            }
        }
    }
}
