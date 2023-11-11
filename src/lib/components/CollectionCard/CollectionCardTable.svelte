<script lang="ts">
    import { json } from "@sveltejs/kit";
    import { writable } from "svelte/store";
    import {
        useCountCollectionCard,
        useFindManyCollectionCard,
    } from "$lib/hooks";
    import {
        createSvelteTable,
        flexRender,
        getCoreRowModel,
        getPaginationRowModel,
        type TableOptions,
        type PaginationTableState,
        type PaginationState,
        type OnChangeFn,
    } from "@tanstack/svelte-table";
    import _ from "lodash";
    import { paginate } from "$lib/pagination";
    import type { CollectionCard } from "@prisma/client";
    import { browser } from "$app/environment";
    import { createQuery } from "@tanstack/svelte-query";
    export let initialCollectionCards: any;

    // Define your constants and variables
    const PAGE_SIZE = 10;

    let dataPagination: PaginationState = {
        pageIndex: 1,
        pageSize: 9,
    };
    $: paginationState = {
        display: paginate({
            current: $table.getState().pagination.pageIndex + 1,
            max: $table.getPageCount(),
        }),
    };

    let cardQuery = {
        include: {
            tcgApiCard: {
                include: {
                    set: true,
                },
            },
        },
        orderBy: [
            { tcgApiCard: { set: { releaseDate: "asc" } } },
            { tcgApiCard: { number: "asc" } },
        ],
        take: 9,
        skip: dataPagination.pageIndex,
    };

    const collectionCardCountQuery = useCountCollectionCard();
    let collectionCardCount: number = 0;
    collectionCardCount = $collectionCardCountQuery.data ?? 0;

    async function fetchCards(page = 0) {
        cardQuery.skip = page * dataPagination.pageSize;
        const cardPromise = await fetch(
            `/api/model/collectionCard/findMany?q=${JSON.stringify(cardQuery)}`
        );
        const cardJson = await cardPromise.json();
        // debugger;
        console.log(cardJson);
        $options.data = cardJson.data;
        return cardJson;
    }

    const columns = [
        {
            accessorKey: "id",
            header: () => "ID",
            // cell: (info: any) => TcgSetImage,
            size: 50,
        },
    ];
    let fetchedCardz = writable<CollectionCard[]>([]);
    async function onPaginationChange(
        updater
    ): Promise<OnChangeFn<PaginationState>> {
        if (updater instanceof Function) {
            dataPagination = updater(dataPagination);
        } else {
            dataPagination = updater;
        }
        options.update((old) => ({
            ...old,
            state: {
                ...old.state,
                pagination: dataPagination,
            },
        }));
    }
    $: query = createQuery<CollectionCard[], any>({
        queryKey: ["todos", dataPagination.pageIndex],
        queryFn: () => fetchCards(dataPagination.pageIndex),
        initialData: [],
    });

    $: {
        if ($table.getState) {
            console.log($table.getState().pagination);
        }
    }

    // Define your options store
    const options = writable<TableOptions<CollectionCard>>({
        data: $query?.data ?? [],
        columns: columns,
        getCoreRowModel: getCoreRowModel(),
        state: {
            pagination: dataPagination,
        },
        onPaginationChange: onPaginationChange,
        manualPagination: true,
        pageCount: 99,
    });
    let table = createSvelteTable(options);
</script>

<div class="p-2">
    <div class="flex justify-center gap-2">
        <span class="flex items-center gap-1 text-xs">
            <div class="w-48">State:</div>

            <select
                class="select select-xs select-bordered w-full max-w-xs"
                on:change={(e) => {
                    requiresCardUpdate = e.target?.value;
                }}
            >
                <option value="all">All</option>
                <option value="true">Stale</option>
                <option value="false">Ok</option>
            </select>
        </span>
    </div>
    <table class="table">
        <thead>
            {#each $table.getHeaderGroups() as headerGroup}
                <tr>
                    {#each headerGroup.headers as header}
                        <th
                            class:cursor-pointer={header.column.getCanSort()}
                            class:select-none={header.column.getCanSort()}
                            on:click={header.column.getToggleSortingHandler()}
                        >
                            {#if !header.isPlaceholder}
                                <svelte:component
                                    this={flexRender(
                                        header.column.columnDef.header,
                                        header.getContext()
                                    )}
                                />
                                {{
                                    asc: "🔼",
                                    desc: "🔽",
                                }[header.column.getIsSorted().toString()] ?? ""}
                            {/if}
                        </th>
                    {/each}
                </tr>
            {/each}
        </thead>
        <tbody>
            {#each $table.getRowModel().rows as row}
                <tr class="hover">
                    {#each row.getVisibleCells() as cell}
                        <td>
                            <svelte:component
                                this={flexRender(
                                    cell.column.columnDef.cell,
                                    cell.getContext()
                                )}
                            />
                        </td>
                    {/each}
                </tr>
            {/each}
        </tbody>
        <!-- <tfoot>
            {#each $table.getFooterGroups() as footerGroup}
                <tr>
                    {#each footerGroup.headers as header}
                        <th>
                            {#if !header.isPlaceholder}
                                <svelte:component
                                    this={flexRender(
                                        header.column.columnDef.footer,
                                        header.getContext()
                                    )}
                                />
                            {/if}
                        </th>
                    {/each}
                </tr>
            {/each}
        </tfoot> -->
    </table>
    <div class="h-4" />
    <div class="flex justify-center">
        <div class="join">
            <button
                class="join-item btn btn-sm"
                on:click={() => $table.previousPage()}
                disabled={_.isNull(paginationState.display.prev)}>«</button
            >
            <div class="w-72 flex justify-center bg-base-200 rounded-none">
                {#each paginationState.display.items as item}
                    {#if typeof item === "string"}
                        <button class="join-item btn btn-sm" style="width: auto"
                            >{item}</button
                        >
                    {:else}
                        <button
                            class="join-item btn btn-sm"
                            style="width: auto"
                            on:click={() => $table.setPageIndex(item - 1)}
                            >{item}</button
                        >
                    {/if}
                {/each}
            </div>
            <button
                class="join-item btn btn-sm"
                on:click={() => $table.nextPage()}
                disabled={false}>»</button
            >
        </div>
    </div>
    <div class="h-2" />
    <div class="flex justify-center gap-2">
        <span class="flex items-center gap-1 text-xs">
            <div class="w-48">| Go to page:</div>

            <select
                class="select select-xs select-bordered w-full max-w-xs"
                on:change={(e) => {
                    const page = e.target?.value
                        ? Number(e.target?.value) - 1
                        : 0;
                    $table.setPageIndex(page);
                }}
            >
                {#each { length: $table.getPageCount() } as _, i}
                    {#if i == $table.getState().pagination.pageIndex}
                        <option value={i + 1} selected>Page: {i + 1}</option>
                    {:else}
                        <option value={i + 1}>Page: {i + 1}</option>
                    {/if}
                {/each}
            </select>
        </span>
    </div>
    <!-- {JSON.stringify(dataPagination)}
    <hr />
    {JSON.stringify($table.getState())}
    <hr /> -->
    {JSON.stringify(cardQuery.skip)}
    <hr />
    {JSON.stringify(dataPagination)}
    <hr />
    <!-- {JSON.stringify($query.data)} -->
    <hr />
    <!-- {JSON.stringify($options.data)} -->
</div>
