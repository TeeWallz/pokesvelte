<script lang="ts">
    import Spaces from "$lib/components/Spaces.svelte";
    import type { PageData } from "./$types";

    export let data: PageData;
</script>

<div class="mt-8 text-center flex flex-col items-center w-full">
    <h1 class="text-2xl text-gray-800">
        Welcome {data.user.name || data.user.email}!
    </h1>

    <div class="w-full lg:p-8">
        <h1 class="text-2xl text-left text-gray-800">Collections</h1>

        <h2 class="text-lg md:text-xl text-left mb-8 text-gray-700">
            Choose a collection to start, or{" "}
            <a class="link link-primary" href="/collection/create">
                create a new one.
            </a>
        </h2>

        <Spaces spaces={data.spaces} />
    </div>

    <div class="w-full lg:p-8">
        <h1 class="text-2xl text-left text-gray-800">Spaces</h1>

        <h2 class="text-lg md:text-xl text-left mb-8 text-gray-700">
            Choose a space to start, or{" "}
            <a class="link link-primary" href="/space/create-space">
                create a new one.
            </a>
        </h2>

        <Spaces spaces={data.spaces} />
    </div>

    <hr class="w-full my-4" />

    <div class="w-full p-8">
        <h1 class="text-2xl text-left text-gray-800">TCG Api Sets</h1>

        <h2 class="text-lg md:text-xl text-left mb-8 text-gray-700">
            Choose a Set to start, or{" "}
            <a class="link link-primary" href="/admin/tcgapi">
                manage TCG Api Data
            </a>
        </h2>

        <Spaces spaces={data.spaces} />
    </div>
</div>
