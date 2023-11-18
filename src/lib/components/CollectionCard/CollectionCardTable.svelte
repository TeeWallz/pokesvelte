<script lang="ts">
    import { json } from "@sveltejs/kit";
    import { writable } from "svelte/store";
    import {
        useAggregateCollectionCard,
        useCountCollectionCard,
        useFindFirstCollectionCard,
        useFindManyCollectionCard,
    } from "$lib/hooks";
    import CollectedCheckbox from "./CollectedCheckbox.svelte";
    import {
        createSvelteTable,
        flexRender,
        getCoreRowModel,
        getPaginationRowModel,
        type TableOptions,
        type PaginationTableState,
        type PaginationState,
        type OnChangeFn,
        type ColumnDef,
        type FiltersTableState,
        type Updater,
        type ColumnFiltersState,
    } from "@tanstack/svelte-table";
    import _ from "lodash";
    import { paginate } from "$lib/pagination";
    import { Prisma, type CollectionCard } from "@prisma/client";
    import { browser } from "$app/environment";
    import { createQuery } from "@tanstack/svelte-query";
    import moment from "moment";
    import { COLLECTION_CARD_QUERY } from "$lib/queryJson";
    import TableColumnFilter from "./TableColumnFilter.svelte";
    import GlobalFilterTextbox from "./GlobalFilterTextbox.svelte";
    export let initialCollectionCards: any;
    export let additionalFilters: any;

    // Define your constants and variables
    const PAGE_SIZE = 9;

    let dataPagination: PaginationState = {
        pageIndex: 1,
        pageSize: 9,
    };
    // let dataFilter: FiltersTableState = {
    //     globalFilter: "",
    //     columnFilters: [],
    // };
    let dataFilter: ColumnFiltersState = [];
    $: paginationState = {
        display: paginate({
            current: dataPagination.pageIndex,
            max: $options.pageCount || 1,
            pageCount: $options.pageCount || 1,
        }),
    };

    let collectionCardCount: number = 0;
    let pageCountSubscribe = 1;
    let globalFilterText = writable("");
    // where owned is true or false
    let isOwnedFilters = {
        true: {
            owned: true,
        },
        false: {
            owned: false,
        },
        all: {},
    };
    let isOwnedFilter = isOwnedFilters["all"];

    $: globalWildcardFilter = {
        where: {
            AND: [
                {
                    ...additionalFilters,
                },
                {
                    ...isOwnedFilter,
                },
                {
                    OR: [
                        {
                            tcgApiCard: {
                                name: {
                                    contains: $globalFilterText,
                                    mode: Prisma.QueryMode.insensitive,
                                },
                            },
                        },
                        {
                            tcgApiCard: {
                                set: {
                                    name: {
                                        contains: $globalFilterText,
                                        mode: Prisma.QueryMode.insensitive,
                                    },
                                },
                            },
                        },
                        {
                            tcgApiCard: {
                                tcgCardId: {
                                    contains: $globalFilterText,
                                    mode: Prisma.QueryMode.insensitive,
                                },
                            },
                        },
                        {
                            collection: {
                                name: {
                                    contains: $globalFilterText,
                                    mode: Prisma.QueryMode.insensitive,
                                },
                            },
                        },
                    ],
                },
            ],
        },
    };
    let cardQuery = { skip: (dataPagination.pageIndex - 1) * PAGE_SIZE };
    $: {
        cardQuery = {
            ...COLLECTION_CARD_QUERY,
            ...globalWildcardFilter,
            skip: (dataPagination.pageIndex - 1) * PAGE_SIZE,
        };
        fetchCards();
    }

    async function fetchCards(page = 0) {
        if (browser) {
            cardQuery.skip = (dataPagination.pageIndex - 1) * PAGE_SIZE;
            const cardPromise = await fetch(
                `/api/model/collectionCard/findMany?q=${JSON.stringify(
                    cardQuery
                )}`
            );
            const cardJson = await cardPromise.json();

            const countPromise = await fetch(
                `/api/model/collectionCard/count?q=${JSON.stringify({
                    ...globalWildcardFilter,
                })}`
            );
            const countJson = await countPromise.json();
            // debugger;
            console.log(cardJson);
            console.log(countJson);
            $options.data = cardJson.data;
            $options.pageCount = Math.ceil(countJson.data / PAGE_SIZE);
        }
    }

    const columns: ColumnDef<CollectionCard, any>[] = [
        {
            accessorKey: "collection.name",
            header: () => "Collection",
            // cell: (info: any) => TcgSetImage,
            size: 50,
        },
        {
            accessorKey: "tcgApiCard.tcgCardId",
            header: () => "ID",
            // cell: (info: any) => TcgSetImage,
            size: 50,
        },
        {
            accessorKey: "tcgApiCard.name",
            header: () => "Name",
            // cell: (info: any) => TcgSetImage,
            size: 50,
        },
        {
            accessorKey: "tcgApiCard.set.name",
            header: () => "Set",
            // cell: (info: any) => TcgSetImage,
            size: 50,
        },
        {
            accessorKey: "tcgApiCard.set.releaseDate",
            header: () => "Set",
            cell: (info: any) =>
                moment(info.row.original.releaseDate).format("YYYY-MM-DD"),
            size: 50,
        },
        {
            accessorKey: "owned",
            header: () => "Owned",
            cell: (info: any) => CollectedCheckbox,
            size: 50,
        },
        {
            accessorKey: "ownedVariation",
            header: () => "Owned Variation",
            cell: (info: any) => CollectedCheckbox,
            size: 50,
        },
    ];
    let fetchedCardz = writable<CollectionCard[]>([]);
    async function onPaginationChange(updater) {
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
            pageCount: pageCountSubscribe,
        }));
    }
    const onColumnFiltersChange = (updater: Updater<ColumnFiltersState>) => {
        // debugger;
        updater instanceof Function ? updater(dataFilter) : updater;
        console.log(updater.toString());
        console.log(dataFilter);
        // options.update((old) => ({
        //     ...old,
        //     state: {
        //         ...old.state,
        //         columnFilters: dataFilter,
        //     },
        // }));
    };
    // $: query = createQuery<CollectionCard[], any>({
    //     queryKey: ["todos", dataPagination.pageIndex],
    //     queryFn: () => fetchCards(dataPagination.pageIndex),
    //     initialData: initialCollectionCards,
    // });
    // Define your options store
    const options = writable<TableOptions<CollectionCard>>({
        data: initialCollectionCards,
        columns: columns,
        getCoreRowModel: getCoreRowModel(),
        state: {
            pagination: dataPagination,
        },
        // enableColumnFilters: true,
        onPaginationChange: onPaginationChange,
        manualPagination: true,
        pageCount: pageCountSubscribe,
    });
    let table = createSvelteTable(options);
</script>

<div class="p-2 w-full">
    <div class="flex justify-center flex-column gap-6 w-full h-24">
        <div class="form-control w-full max-w-xs">
            <label class="label">
                <span class="label-text">Collected?</span>
            </label>
            <select
                class="select select-bordered w-full max-w-xs"
                on:change={(e) => {
                    const value = e.target?.value;
                    isOwnedFilter = isOwnedFilters[value];
                }}
            >
                <option value="all">All</option>
                <option value="false">Not Owned</option>
                <option value="true">Owned</option>
            </select>
        </div>
        <div class="flex items-center gap-1 text-xs pl-8">
            <GlobalFilterTextbox parentValue={globalFilterText} />
        </div>
    </div>
    <div>
        <div>
            <div class="flex justify-center">
                <div class="join">
                    <button
                        class="join-item btn btn-sm"
                        on:click={() => dataPagination.pageIndex--}
                        disabled={_.isNull(paginationState.display.prev)}
                        >«</button
                    >
                    <div
                        class="w-72 flex justify-center bg-base-200 rounded-none"
                    >
                        {#each paginationState.display.items as item}
                            {#if typeof item === "string"}
                                <button
                                    class="join-item btn btn-sm"
                                    style="width: auto">{item}</button
                                >
                            {:else if item == dataPagination.pageIndex}
                                <button
                                    class="join-item btn btn-sm btn-primary"
                                    style="width: auto"
                                    on:click={() =>
                                        (dataPagination.pageIndex = item)}
                                    >{item}</button
                                >
                            {:else}
                                <button
                                    class="join-item btn btn-sm"
                                    style="width: auto"
                                    on:click={() =>
                                        (dataPagination.pageIndex = item)}
                                    >{item}</button
                                >
                            {/if}
                        {/each}
                    </div>
                    <button
                        class="join-item btn btn-sm"
                        on:click={() => dataPagination.pageIndex++}
                        disabled={_.isNull(paginationState.display.next)}
                        >»</button
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
                                ? Number(e.target?.value)
                                : 0;
                            dataPagination.pageIndex = page;
                        }}
                    >
                        {#each { length: $table.getPageCount() } as _, i}
                            {#if i == dataPagination.pageIndex - 1}
                                <option value={i + 1} selected
                                    >Page: {i + 1}</option
                                >
                            {:else}
                                <option value={i + 1}>Page: {i + 1}</option>
                            {/if}
                        {/each}
                    </select>
                </span>
            </div>
        </div>
    </div>
    <table class="table w-full">
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
                                {#if header.column.getCanFilter()}
                                    <!-- <div>
                                        <TableColumnFilter
                                            column={header.column}
                                            {table}
                                        />
                                    </div> -->
                                {/if}
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
    <!-- isOwnedFilter - {JSON.stringify(isOwnedFilter)} -->
    <!-- <hr /> -->
    <!-- globalFilterText - {$globalFilterText} -->
    <!-- <hr /> -->
    <!-- globalFilterJson - {globalWildcardFilter} -->
    <!-- <hr /> -->
    <!-- {JSON.stringify(dataPagination.pageIndex)} -->
    <!-- <hr /> -->
    <!-- {JSON.stringify(dataFilter)} -->
    <!-- <hr /> -->
    <!-- {JSON.stringify(paginationState)} -->
    <!-- <hr /> -->
    <!-- {JSON.stringify($table.getState())} -->
    <!-- <hr /> -->
    <!-- <!-- {JSON.stringify(cardQuery.skip)} -->
    <!-- <hr /> -->
    <!-- dataPagination - {JSON.stringify(dataPagination)} -->
    <!-- <hr /> -->
    <!-- paginationState - {JSON.stringify(paginationState)} -->
    <!-- <hr /> -->
    <!-- cardQuery - {JSON.stringify(cardQuery)} -->
    <!-- <hr /> -->
    <!-- pageCountWritable {JSON.stringify($pageCountWritable)} -->
    <!-- <hr /> -->
    <!-- pageCountSubscribe {JSON.stringify(pageCountSubscribe)} -->
</div>
