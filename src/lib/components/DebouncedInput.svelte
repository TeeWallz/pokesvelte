<script lang="ts">
    import { onMount, afterUpdate, onDestroy } from "svelte";

    export let value: string | number;
    export let onChange: (value: string | number) => void;
    export let debounce: number = 500;

    let localValue = value;

    // onMount(() => {
    //     localValue = value;
    // });

    // afterUpdate(() => {
    //     const timeout = setTimeout(() => {
    //         onChange(localValue);
    //     }, debounce);

    //     return () => clearTimeout(timeout);
    // });

    // $: {
    //     localValue = value;
    // }
</script>

<!-- <input bind:value={localValue} {...$$restProps} on:input={() => {}} /> -->
<input
    {...$$restProps}
    bind:value={localValue}
    on:input={(e) => {
        onChange(localValue);
    }}
/>
