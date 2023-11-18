<script lang="ts">
    import type { PageData } from "./$types";
    import { page } from "$app/stores";
    import CollectionCardTable from "$lib/components/CollectionCard/CollectionCardTable.svelte";
    import type { useFindManyCollectionCard } from "$lib/hooks/collection-card";
    $: previousEnabled = data.p > 1;
    $: nextEnabled = data.p < 10;
    let collectionCardsQuery: ReturnType<typeof useFindManyCollectionCard>;
    $: collectionCardsQuery;

    export let data: PageData;
</script>

<div>
    <CollectionCardTable
        bind:collectionCardsQuery
        initialCollectionCards={data.collectionCards}
        initialCardQuery={data.initialCardQuery}
        additionalFilters={{}}
    />
</div>
