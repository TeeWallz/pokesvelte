<script lang="ts">
    import BreadCrumb from "$lib/components/BreadCrumb.svelte";
    import CreateListDialog from "$lib/components/CreateListDialog.svelte";
    import SpaceMembers from "$lib/components/SpaceMembers.svelte";
    import TodoList from "$lib/components/TodoList.svelte";
    import TcgApiSets from "$lib/components/TcgApi/TcgApiSets.svelte";
    import { enhance } from "$app/forms";
    import type { PageData } from "./$types";
    import { invalidateAll } from "$app/navigation";
    import type { useFindManyTcgApiSet } from "$lib/hooks";

    export let data: PageData;
    let loadingSets = false;
    let loadingCards = false;
    let tcgApiSetsQuery: ReturnType<typeof useFindManyTcgApiSet>;

    // console.log(query);

    // setInterval(() => {
    //     invalidateAll();
    // }, 10000);
</script>

<div class="max-w-7xl mx-auto">
    <!-- <div class="px-8 py-2">
        <BreadCrumb space={data.space} />
    </div> -->
    <h1 class="text-3xl text-center text-gray-800 mb-5">TCG Api Sets</h1>

    <div class="flex justify-center">
        <form
            method="POST"
            action="?/getTcgCards"
            class="flex flex-row-reverse"
            use:enhance={({
                formElement,
                formData,
                action,
                cancel,
                submitter,
            }) => {
                loadingSets = true;

                return async ({ result, update }) => {
                    loadingSets = false;
                    update();
                    $tcgApiSetsQuery.refetch();
                };
            }}
        >
            <button
                type="submit"
                class="btn btn-xs sm:btn-sm md:btn-md align:right text-right w-44"
            >
                {#if loadingSets}
                    <span class="loading loading-spinner loading-xs" />
                {:else}Download Cards{/if}
            </button>
        </form>
        <form
            method="POST"
            action="?/getTcgSets"
            class="flex flex-row-reverse"
            use:enhance={({
                formElement,
                formData,
                action,
                cancel,
                submitter,
            }) => {
                loadingCards = true;

                return async ({ result, update }) => {
                    loadingCards = false;
                    update();
                    $tcgApiSetsQuery.refetch();
                };
            }}
        >
            <button
                type="submit"
                class="btn btn-xs sm:btn-sm md:btn-md align:right text-right w-44"
            >
                {#if loadingCards}
                    <span class="loading loading-spinner loading-xs" />
                {:else}Download Sets{/if}
            </button>
        </form>
    </div>

    <div class="lg:p-8">
        <TcgApiSets initialSets={data.tcgApiSets} bind:tcgApiSetsQuery />
    </div>
</div>
