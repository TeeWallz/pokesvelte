import type { PrismaClient, Prisma } from "@prisma/client";
import type { DefaultArgs } from "@prisma/client/runtime/library";
import { TcgApiSetProvider } from "$lib/providers/tcgApiSetProvider";
import { TcgApiCardProvider } from "$lib/providers/tcgApiCardProvider";
import schedule from "node-schedule";

const setsCardsToSync = 5;
const setsCron = "0 0 * * *";
const cardsCron = "1 0 * * *";

const syncTcgSets = async (
    prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
) => {
    const tcgApiSetProvider = new TcgApiSetProvider(prisma);
    await tcgApiSetProvider.getSets();
};

const syncTcgCards = async (
    prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
) => {
    const tcgApiCardProvider = new TcgApiCardProvider(prisma);
    await tcgApiCardProvider.getCardsForSetsNeedingUpdate(setsCardsToSync);
};

export const createJobs = (
    prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
) => {
    console.log("Creating jobs");
    return [
        schedule.scheduleJob(setsCron, function () {
            syncTcgSets(prisma);
        }),
        schedule.scheduleJob(cardsCron, function () {
            syncTcgCards(prisma);
        }),
    ];
};
