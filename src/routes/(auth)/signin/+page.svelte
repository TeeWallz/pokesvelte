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
                <span class="notSignedInText">You are not signed in</span>
                <br />
                <div class="flex flex-col w-full border-opacity-50">
                    <a href="/auth/signin" class="btn">Sign in</a>
                    <div class="divider">OR</div>
                    <a href="/signup" class="btn">Sign up with Email</a>
                </div>
                <a />
                <br />
                <a href="/signup" />
            </div>
        </div>
    </div>
</div>
