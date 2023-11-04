<script lang="ts">
    import { setContext } from "svelte";
    import NavBar from "$lib/components/NavBar.svelte";
    import LeftSidebar from "$lib/components/MainLayout/LeftSidebar.svelte";
    import type { LayoutData } from "./$types";

    $: if (data.session.user) {
        setContext("currentUser", data.session.user);
    }

    export let data: LayoutData;
    //  🔵	initial value of drawer
    let isDrawerOpen = false;
</script>

<div>
    <div class="drawer">
        <input id="my-drawer-3" type="checkbox" class="drawer-toggle" />
        <div class="drawer-content flex flex-col">
            <!-- Navbar -->
            <div class="w-full navbar bg-base-300">
                <div class="flex-none lg:hidden">
                    <label
                        for="my-drawer-3"
                        aria-label="open sidebar"
                        class="btn btn-square btn-ghost"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            class="inline-block w-6 h-6 stroke-current"
                            ><path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M4 6h16M4 12h16M4 18h16"
                            /></svg
                        >
                    </label>
                </div>
                <div class="flex-1 px-2 mx-2">Navbar Title</div>
                <div class="flex-none hidden lg:block">
                    <ul class="menu menu-horizontal">
                        <!-- Navbar menu content here -->
                        <li><a>Navbar Item 1</a></li>
                        <li><a>Navbar Item 2</a></li>
                    </ul>
                </div>
            </div>
        </div>
        <div class="drawer-side">
            <label
                for="my-drawer-3"
                aria-label="close sidebar"
                class="drawer-overlay"
            />
            <ul class="menu p-4 w-80 min-h-full bg-base-200">
                <!-- Sidebar content here -->
                <li><a>Sidebar Item 1</a></li>
                <li><a>Sidebar Item 2</a></li>
            </ul>
        </div>
    </div>
    <div class="drawer lg:drawer-open">
        <input id="my-drawer-2" type="checkbox" class="drawer-toggle" />
        <div class="drawer-content flex flex-col items-center">
            <!-- Page content here -->
            <slot />
            <label
                for="my-drawer-2"
                class="btn btn-primary drawer-button lg:hidden"
                >Open drawer</label
            >
        </div>
        <div class="drawer-side">
            <label
                for="my-drawer-2"
                aria-label="close sidebar"
                class="drawer-overlay"
            />
            <ul class="menu p-4 w-80 min-h-full bg-base-200 text-base-content">
                <!-- Sidebar content here -->
                <li>
                    <a href="/collection"> Collections </a>
                </li>
                <li>
                    <a href="/cards"> Cards </a>
                </li>
            </ul>
        </div>
    </div>
</div>
