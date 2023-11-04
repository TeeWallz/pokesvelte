<script lang="ts">
    import type { CollectionCard, TcgApiSet } from "@prisma/client";
    import CollectedCheckbox from "./CollectedCheckbox.svelte";
    export let initialCollectionCards: CollectionCard[];
    export let initialCardQuery: any;

    import { writable } from "svelte/store";
    import {
        createSvelteTable,
        flexRender,
        getCoreRowModel,
        getSortedRowModel,
        getPaginationRowModel,
        type PaginationState,
        type OnChangeFn,
        type SortingState,
        type SortingTableState,
        type Column,
    } from "@tanstack/svelte-table";
    import { createQuery } from "@tanstack/svelte-query";
    import type {
        ColumnDef,
        TableOptions,
    } from "@tanstack/table-core/src/types";
    // import TcgApiSetsTableRow from "./TcgApiSetsTableRow.svelte";
    // import TcgSetImage from "./TcgSetImage.svelte";
    import { paginate } from "$lib/pagination";
    import {
        useFindManyCollectionCard,
        useFindManyTcgApiSet,
    } from "$lib/hooks";
    import _ from "lodash";
    import { mediaQueryMatches } from "$lib/mediaQueries";
    import { chooseColumns } from "$lib/tableUtils";
    import moment from "moment";

    let requiresCardUpdate: "true" | "false" | "all" = "all"; // Set the desired value
    export let collectionCardsQuery: ReturnType<
        typeof useFindManyCollectionCard
    >;

    $: collectionCardsQuery = useFindManyCollectionCard({
        include: {
            tcgApiCard: {
                include: {
                    set: true,
                },
            },
        },
        orderBy: [
            {
                tcgApiCard: {
                    set: {
                        releaseDate: "asc",
                    },
                },
            },
            {
                tcgApiCard: {
                    number: "asc",
                },
            },
        ],
    });

    const columns: { [id: string]: ColumnDef<CollectionCard, any>[] } = {
        mobile: [
            {
                accessorKey: "tcgApiCard",
                header: () => "Set",
                // cell: (info: any) => TcgApiSetsTableRow,
                footer: (info: any) => "Set",
            },
        ],
        tablet: [
            {
                accessorKey: "releaseDate",
                header: () => "Set",
                // cell: (info: any) => TcgApiSetsTableRow,
                footer: (info: any) => "Set",
            },
        ],
        largeTablet: [
            {
                accessorKey: "releaseDate",
                header: () => "Set",
                // cell: (info: any) => TcgApiSetsTableRow,
            },
        ],
        desktop: [
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
                header: () => "Set Name",
            },
            {
                accessorKey: "tcgApiCard.set.series",
                header: () => "Series",
            },
            {
                accessorKey: "tcgApiCard.set.releaseDate",
                header: () => "Release Date",
                cell: (info: any) =>
                    moment(info.row.original.tcgApiCard.set.releaseDate).format(
                        "YYYY-MM-DD"
                    ),
            },
            {
                accessorKey: "owned",
                header: () => "Owned",
                cell: (info: any) => CollectedCheckbox,
            },
            {
                accessorKey: "ownedVariation",
                header: () => "Owned Variation",
                cell: (info: any) => CollectedCheckbox,
            },
        ],
    };

    const chosenColumns = chooseColumns($mediaQueryMatches, columns);

    console.log($mediaQueryMatches);
    let sorting: SortingState = [];

    const setSorting = (
        updater: SortingState | ((arg0: SortingState) => SortingState)
    ) => {
        if (updater instanceof Function) {
            sorting = updater(sorting);
        } else {
            sorting = updater;
        }
        options.update((old) => ({
            ...old,
            state: {
                ...old.state,
                sorting,
            },
        }));
    };

    $: paginationState = {
        display: paginate({
            current: $table.getState().pagination.pageIndex + 1,
            max: $table.getPageCount(),
        }),
    };

    let options = writable<TableOptions<CollectionCard>>({
        data: initialCollectionCards,
        columns: chosenColumns,
        getCoreRowModel: getCoreRowModel(),
        state: {
            sorting,
        },
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(), // Enable pagination
        autoResetPageIndex: true, // Automatically update pagination when data or page size changes
    });

    // const rerender = () => {
    //     options.update((options) => ({
    //         ...options,
    //         data: $tcgApiSets?.data ?? inititalSets,
    //     }));
    // };

    let table = createSvelteTable(options);
    $: $table.setPageSize(9);
    $: options.update((options) => ({
        ...options,
        data: $collectionCardsQuery?.data ?? initialCollectionCards,
    }));
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
    <table class="table table-xs">
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
                <tr>
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
                disabled={_.isNull(paginationState.display.next)}>»</button
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
</div>
