<script lang="ts">
    import debounce from "lodash/debounce";
    import type { Writable } from "svelte/store";

    export let parentValue: Writable<string>;
    let value = "";

    const setFilter = (value: string) => {
        $parentValue = value;
    };

    const onChange = debounce((value) => {
        setFilter(value);
    }, 300);
</script>

<span>
    <div class="form-control w-full max-w-xs">
        <label class="label">
            <span class="label-text">Search</span>
        </label>
        <input
            class="w-64 input input-bordered w-full max-w-xs"
            type="text"
            placeholder="Type here"
            bind:value
            on:input={(e) => {
                onChange(e.target.value);
            }}
        />
    </div>
</span>

<style>
    /* Add your styles here */
</style>
