<script lang="ts">
    import type { ActionData } from "./$types";
    import { signIn, signOut } from "@auth/sveltekit/client";
    import { page } from "$app/stores";
</script>

<div>
    <div
        class="flex flex-col items-center justify-center px-6 pt-4 lg:pt-8 mx-auto h-screen bg-cover bg-[url('/auth-bg.jpg')]"
    >
        <a href="/">
            <div class="flex space-x-4 items-center mb-6 lg:mb-10">
                <img src="/logo.png" width={42} height={42} alt="logo" />
                <h1 class="text-4xl text-white">Welcome to Todo</h1>
            </div>
        </a>
        <div
            class="items-center justify-center w-full bg-white rounded-lg shadow lg:flex md:mt-0 lg:max-w-screen-md xl:p-0"
        >
            <div class="w-full p-6 space-y-8 sm:p-8 lg:p-16">
                <h2 class="text-2xl font-bold text-gray-900 lg:text-3xl">
                    Sign in to your account
                </h2>
                {#if $page.data.session}
                    {#if $page.data.session.user?.image}
                        <span
                            style="background-image: url('{$page.data.session
                                .user.image}')"
                            class="avatar"
                        />
                    {/if}
                    <span class="signedInText">
                        <small>Signed in as</small><br />
                        <strong
                            >{$page.data.session.user?.name ?? "User"}</strong
                        >
                    </span>
                    <button on:click={() => signOut()} class="button"
                        >Sign out</button
                    >
                {:else}
                    <span class="notSignedInText">You are not signed in</span>
                    <br />
                    <button on:click={() => signIn("github")}
                        >Sign In with GitHub</button
                    >
                {/if}
            </div>
        </div>
    </div>
</div>
