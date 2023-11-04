import { sveltekit } from '@sveltejs/kit/vite';

/** @type {import('vite').UserConfig} */
process.env.POKEMONTCG_API_KEY = "";

const config = {
    plugins: [sveltekit()],
    resolve: {
        alias: {
            '.prisma/client/index-browser':
                './node_modules/.prisma/client/index-browser.js',
        },
    },
    ssr: {
        // this is needed to make sure "vite" processes "@tanstack/svelte-query" imported inside
        // "@zenstackhq/tanstack-query"
        noExternal: ['@zenstackhq/tanstack-query'],
    },
};

export default config;
