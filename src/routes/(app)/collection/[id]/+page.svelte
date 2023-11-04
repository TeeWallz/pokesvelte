<script lang="ts">
    import BreadCrumb from "$lib/components/BreadCrumb.svelte";
    import CreateListDialog from "$lib/components/CreateListDialog.svelte";
    import SpaceMembers from "$lib/components/SpaceMembers.svelte";
    import TodoList from "$lib/components/TodoList.svelte";
    import moment from "moment";
    import type { PageData } from "./$types";

    export let data: PageData;
</script>

<div class="flex items-center justify-center h-full flex-col$: start = $page.query.p * $page.query.itemsPerPage;
$: end = start + $page.query.itemsPerPage;

$: slice = myData.slice(start, end); // plus filtering, sorting etc">
    <div class="px-8 py-2">
        <!-- <BreadCrumb space={data.space} /> -->
    </div>
    <div class="p-8 space-y-4">
        <h1 class="text-2xl text-center">
            Collection - {data?.collection?.name}
        </h1>

        <ul class="">
            {#if data?.collectionCards}
                <table class="table table-zebra">
                    <thead>
                        <tr>
                            <th>Card</th>
                            <th>Set</th>
                            <th>Release Date</th>
                            <th>Owned</th>
                            <th>Owned Variation</th>
                        </tr>
                    </thead>
                    <tbody class="text-center">
                        {#each data.collectionCards as card (card.id)}
                            <tr>
                                <td>{card.tcgApiCard.name}</td>
                                <td>{card.tcgApiCard.set.name}</td>
                                <td
                                    >{moment(
                                        card.tcgApiCard.set.releaseDate
                                    ).format("YYYY-MM-DD")}</td
                                >
                                <td>{card.owned}</td>
                                <td>{card.ownedVariation}</td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            {/if}
        </ul>
    </div>
</div>
