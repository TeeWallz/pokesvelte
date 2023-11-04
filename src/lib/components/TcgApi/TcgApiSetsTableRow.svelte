<script>
    import moment from "moment";
</script>

<div class="flex items-center space-x-3">
    <div class="w-10 h-10 object-contain">
        <img
            class="object-contain max-h-10 max-w-10"
            src={$$props.row.original.images.symbol}
        />
    </div>
    <div>
        <div class="font-bold">
            {$$props.row.original.name}
            {#if $$props.row.original.requiresCardUpdate}
                <div class="badge badge-neutral badge-xs">stale</div>
            {:else}
                <div class="badge badge-xs">ok</div>
            {/if}
            <div class="text-xs opacity-50">
                <span class=""
                    >{moment($$props.row.original.releaseDate).format(
                        "YYYY-MM-DD"
                    )} | {$$props.row.original.series}</span
                >
            </div>
        </div>
    </div>
</div>
