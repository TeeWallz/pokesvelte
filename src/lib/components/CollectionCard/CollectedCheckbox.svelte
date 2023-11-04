<script lang="ts">
    import { useUpdateCollectionCard } from "$lib/hooks";
    const updateCard = useUpdateCollectionCard();
    function changeOwned() {
        const mutator =
            $$props.column.id === "owned" ? "owned" : "ownedVariation";
        $updateCard.mutate({
            where: { id: $$props.row.original.id },
            data: {
                [mutator]: !$$props.cell.getValue(),
            },
        });
        // $updateCard.mutate({
        //     where: { id: $$props.row.original.id },
        //     data: { owned: !$$props.cell.getValue() },
        // });
    }
</script>

<input
    type="checkbox"
    on:click={changeOwned}
    checked={$$props.cell.getValue()}
/>
