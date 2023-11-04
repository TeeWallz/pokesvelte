<script lang="ts">
    import { applyAction, deserialize, enhance } from "$app/forms";
    import { goto, invalidateAll } from "$app/navigation";
    import TcgApiCardTable from "$lib/components/TcgApiCard/TcgApiCardTable.svelte";

    import type { Prisma } from "@prisma/client";
    import type { ActionData } from "../../$types";
    import type { Card, Parameter } from "pokemon-tcg-sdk-typescript/dist/sdk";
    import type { ActionResult } from "@sveltejs/kit";

    export let form: ActionData;

    let name: string = "";
    let filter: string = "name:charizard";
    let tcgQuery: Parameter;
    let loadingCards = false;
    let creatingCollection = false;
    let tcgApiCards: Card[] = [];

    async function getCards() {
        loadingCards = true;
        const data = new FormData();
        data.append("filter", filter);
        const response = await fetch("?/tcgApiGetCards", {
            method: "POST",
            body: data,
        });

        const result: ActionResult = deserialize(await response.text());
        if (result.type === "success") {
            tcgApiCards = result.data!.cards;
        }

        loadingCards = false;
    }

    async function createCollection() {
        creatingCollection = true;
        const data = new FormData();
        data.append("name", name);
        data.append("filter", filter);
        data.append("cards", JSON.stringify(tcgApiCards.map((c) => c.id)));
        const response = await fetch("?/createCollection", {
            method: "POST",
            body: data,
        });

        const result: ActionResult = deserialize(await response.text());
        // if (result.type === "success") {
        //     goto(`/collection/${result.data!.collection.id}`);
        // }
    }

    async function handleSubmit(event) {
        const data = new FormData(event);
        debugger;
        // const response = await fetch(this.action, {
        //     method: "POST",
        //     body: data,
        // });
        // /** @type {import('@sveltejs/kit').ActionResult} */
        // const result = await response.json();
        // if (result.type === "success") {
        //     // re-run all `load` functions, following the successful update
        //     await invalidateAll();
        // }
        // applyAction(result);
    }
</script>

<div class="flex items-center justify-center h-full flex-col">
    <form method="POST" on:submit|preventDefault={handleSubmit}>
        <div>
            <div class="flex space-x-4 mt-6 justify-between">
                <h1 class="text-3xl mb-8">Create a space</h1>

                <div class="flex">
                    <div>
                        <button
                            type="button"
                            class="btn w-48"
                            on:click={getCards}
                            disabled={loadingCards}
                        >
                            {#if loadingCards}
                                <span
                                    class="loading loading-spinner loading-xs"
                                />
                            {:else}Download Cards{/if}
                        </button>
                    </div>
                    <button
                        type="button"
                        disabled={tcgApiCards.length === 0 || name === ""}
                        on:click={createCollection}
                        value="Create"
                        class="btn btn-primary px-8"
                    >
                        {#if creatingCollection}
                            <span class="loading loading-spinner loading-xs" />
                        {:else}Create Collection{/if}
                    </button>
                    <button class="btn btn-outline" on:click={() => goto("/")}>
                        Cancel
                    </button>
                </div>
            </div>
            <div class="flex">
                <div>
                    <label for="name" class="text-lg"> Collection name </label>
                    <!-- svelte-ignore a11y-autofocus -->
                    <input
                        name="name"
                        type="text"
                        placeholder="Name of your collection"
                        class="input input-bordered w-full max-w-xs mt-2"
                        bind:value={name}
                        autoFocus
                    />
                </div>

                <div>
                    <div>
                        <label for="slug" class="text-lg">
                            Collection Filter
                        </label>
                        <input
                            name="filter"
                            type="text"
                            required
                            placeholder="TCG Api Filter"
                            class="input input-bordered w-full max-w-xs mt-2"
                            bind:value={filter}
                        />
                    </div>
                </div>
            </div>
        </div>
        <div>
            <TcgApiCardTable bind:tcgApiCards />
        </div>
    </form>
</div>
