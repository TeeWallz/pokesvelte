<script lang="ts">
    import type { TcgApiCard, Prisma } from "@prisma/client";

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
    import _ from "lodash";
    import { mediaQueryMatches } from "$lib/mediaQueries";
    import { chooseColumns } from "$lib/tableUtils";
    import moment from "moment";
    import { PokemonTCG } from "pokemon-tcg-sdk-typescript";
    import type { Card } from "pokemon-tcg-sdk-typescript/dist/sdk";
    import CardImage from "$lib/components/TcgApiCard/CardImage.svelte";

    export let tcgApiCards: Card[];

    const columns: { [id: string]: ColumnDef<Card, any>[] } = {
        mobile: [
            {
                accessorKey: "releaseDate",
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
                accessorKey: "id",
                header: () => "id",
                // cell: (info: any) => TcgSetImage,
                size: 50,
            },
            {
                accessorKey: "name",
                header: () => "Name",
            },
            {
                accessorKey: "set.name",
                header: () => "Set",
                // cell: (info: any) => TcgSetImage,
                size: 50,
            },
            {
                accessorKey: "set.releaseDate",
                header: () => "Release Date",
                // cell: (info: any) => TcgSetImage,
                size: 50,
            },
            {
                accessorKey: "set.series",
                header: () => "Series",
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

    let options = writable<TableOptions<Card>>({
        data: [],
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

    let table = createSvelteTable(options);
    $: $table.setPageSize(9);
    $: options.update((options) => ({
        ...options,
        data: tcgApiCards ?? [],
    }));
</script>

<div class="p-2">
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
                type="button"
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
                type="button"
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
