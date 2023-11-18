<script lang="ts">
    import { onMount } from "svelte";
    import { writable, type Writable } from "svelte/store";
    import DebouncedInput from "$lib/components/DebouncedInput.svelte";
    import type { Column, Table } from "@tanstack/svelte-table";
    import { debounce } from "lodash";

    export let column: Column<any, unknown>;
    export let table: Writable<Table<any>>;

    let firstValue: any;
    let columnFilterValue = writable(column.getFilterValue());

    let sortedUniqueValues: any[] = [];

    onMount(() => {
        firstValue = $table
            .getPreFilteredRowModel()
            .flatRows[0]?.getValue(column.id);

        sortedUniqueValues =
            typeof firstValue === "number"
                ? []
                : Array.from(column.getFacetedUniqueValues().keys()).sort();
    });

    const debouncedInput = debounce((value) => {
        columnFilterValue.set(value);

        if (typeof firstValue === "number") {
            column.setFilterValue((old) => [value, old?.[1]]);
        } else {
            column.setFilterValue(value);
        }
    }, 300);
</script>

{#if typeof firstValue === "number"}
    <div>
        <div class="flex space-x-2">
            <DebouncedInput
                type="number"
                min={Number(column.getFacetedMinMaxValues()?.[0] ?? "")}
                max={Number(column.getFacetedMinMaxValues()?.[1] ?? "")}
                bind:value={$columnFilterValue[0]}
                on:input={(e) => debouncedInput(e.target.value)}
                onChange="{(value) =>
                    column.setFilterValue((old) => [value, old?.[1]])}}"
                placeholder={`Min ${
                    column.getFacetedMinMaxValues()?.[0]
                        ? `(${column.getFacetedMinMaxValues()?.[0]})`
                        : ""
                }`}
                class="w-24 border shadow rounded"
            />
            <DebouncedInput
                type="number"
                min={Number(column.getFacetedMinMaxValues()?.[0] ?? "")}
                max={Number(column.getFacetedMinMaxValues()?.[1] ?? "")}
                bind:value={$columnFilterValue[1]}
                on:input={(e) => debouncedInput(e.target.value)}
                onChange={(value) =>
                    column.setFilterValue((old) => [old?.[0], value])}
                placeholder={`Max ${
                    column.getFacetedMinMaxValues()?.[1]
                        ? `(${column.getFacetedMinMaxValues()?.[1]})`
                        : ""
                }`}
                class="w-24 border shadow rounded"
            />
        </div>
        <div class="h-1" />
    </div>
{:else}
    <datalist id={column.id + "list"}>
        {#each sortedUniqueValues.slice(0, 5000) as value (value)}
            <option {value} key={value} />
        {/each}
    </datalist>
    <DebouncedInput
        type="text"
        bind:value={$columnFilterValue}
        on:input={(e) => debouncedInput(e.target.value)}
        onChange={(value) => {
            console.log(`value=${value}`);
            column.setFilterValue(value);
        }}
        placeholder={`Search... (${column.getFacetedUniqueValues().size})`}
        class="w-36 border shadow rounded"
        list={column.id + "list"}
    />
    <div class="h-1" />
{/if}
