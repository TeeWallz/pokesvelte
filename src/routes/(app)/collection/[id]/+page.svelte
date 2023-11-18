<script lang="ts">
    import type { PageData } from "./$types";
    import { page } from "$app/stores";
    import CollectionCardTable from "$lib/components/CollectionCard/CollectionCardTable.svelte";
    import type {
        useFindManyCollectionCard,
        useCountCollectionCard,
    } from "$lib/hooks/collection-card";
    import BreadCrumb from "$lib/components/BreadCrumb.svelte";
    import CreateListDialog from "$lib/components/CreateListDialog.svelte";
    import SpaceMembers from "$lib/components/SpaceMembers.svelte";
    import TodoList from "$lib/components/TodoList.svelte";
    import moment from "moment";
    export let data: PageData;

    let collectionCardsQuery: ReturnType<typeof useFindManyCollectionCard>;
    $: collectionCardsQuery;
</script>

<div
    class="flex justify-center h-full flex-col$: start = $page.query.p * $page.query.itemsPerPage;
  $: end = start + $page.query.itemsPerPage;

  $: slice = myData.slice(start, end); // plus filtering, sorting etc"
>
    <div class="px-8 py-2">
        <!-- <BreadCrumb space={data.space} /> -->
    </div>
    <div class="p-8 space-y-4">
        <h1 class="text-2xl text-center">
            Collection - {data?.collection?.name}
        </h1>

        <CollectionCardTable
            bind:collectionCardsQuery
            initialCollectionCards={data.collectionCards ?? []}
            additionalFilters={{
                collectionId: data?.collection?.id,
            }}
        />
    </div>
</div>
