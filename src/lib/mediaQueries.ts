let query = {
    mobile: "(max-width: 480px)",
    tablet: "(min-width: 480px) and (max-width: 768px)",
    largeTablet: "(min-width: 768px) and (max-width: 1200px)",
    desktop: "(min-width: 1200px)",
    other: ["(min-width: 1200px)", "(max-height: 900px)"],
    themes: {
        dark: "(prefers-color-scheme: dark)",
        light: "(prefers-color-scheme: light)",
    },
};

import { createMediaStore } from "svelte-media-queries";

export const mediaQueryMatches = createMediaStore(query); //The type of the store will completely repeat the query
