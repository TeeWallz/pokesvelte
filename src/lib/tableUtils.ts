import type { TcgApiSet } from "@prisma/client";
import type { Column, ColumnDef, RowData } from "@tanstack/svelte-table";
import type { MediaStore } from "svelte-media-queries/utils/mediaStore";

export function chooseColumns<TData extends RowData>(
    mediaQueryBooleans:
        | {
              mobile: string;
              tablet: string;
              largeTablet: string;
              desktop: string;
              other: string[];
              themes: { dark: string; light: string };
          }
        | undefined,
    columns: { [id: string]: ColumnDef<TData, any>[] }
) {
    let activeMedia: string | null = null;

    if (mediaQueryBooleans?.desktop) {
        activeMedia = "desktop";
    } else if (mediaQueryBooleans?.largeTablet) {
        activeMedia = "largeTablet";
    } else if (mediaQueryBooleans?.tablet) {
        activeMedia = "tablet";
    } else if (mediaQueryBooleans?.mobile) {
        activeMedia = "mobile";
    }

    if (activeMedia) {
        return columns[activeMedia];
    }

    if (activeMedia) {
        return columns[activeMedia];
    }

    // Return a default set of columns if none of the media queries match.
    return columns.desktop;
}
