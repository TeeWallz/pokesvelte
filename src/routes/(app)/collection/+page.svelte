<script lang="ts">
    import type { PageData } from "./$types";
    import { useFindManyCollection } from "$lib/hooks";

    export let data: PageData;

    let ass: any = [];
    // $: collections = useFindManyCollection();
    // $: aggregate = getCollectionEnriched();

    const collectionsQuery = useFindManyCollection({
        include: {
            collectionCards: true, // Include related CollectionCards
        },
    });

    $: collections = $collectionsQuery.data?.map((collection) => {
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
</script>

<div class="flex items-center flex-col align-top">
    <div
        class="flex flex-1 w-full"
        style="  display: grid; grid-template-columns: 1fr repeat(3, auto) 1fr; grid-column-gap: 5px; justify-items: center;"
    >
        <h1 class="text-3xl" style="grid-column-start: 2;">Collections</h1>
        <a class="btn" href="/collection/create">Create</a>
    </div>
    <div>
        <table class="table">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Filter</th>
                    <th>Owned</th>
                    <th>Owned Variations</th>
                </tr>
            </thead>
            <tbody>
                {#if data.collections}
                    {#each data.collections as collection (collection.id)}
                        <tr>
                            <td>
                                {collection.name}
                            </td>
                            <td>{collection.tcgApiFilter}</td>
                            <td>
                                <span class="badge badge-sm badge-warning">
                                    {collection.ownedCount}/{collection.cardTotal}
                                </span>
                            </td>
                            <td>
                                <span class="badge badge-sm badge-warning">
                                    {collection.ownedVariationCount}/?
                                </span>
                            </td>
                            <td>
                                <a
                                    class="btn btn-ghost btn-xs"
                                    href={`/collection/${collection.id}`}
                                >
                                    details
                                </a>
                            </td>
                        </tr>
                    {/each}
                {/if}
            </tbody>
        </table>
    </div>
</div>
