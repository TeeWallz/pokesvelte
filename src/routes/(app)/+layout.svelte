<script lang="ts">
  import NavBar from "$lib/components/NavBar.svelte";
  import { setContext } from "svelte";
  import type { LayoutData } from "./$types";

  $: if (data.session.user) {
    setContext("currentUser", data.session.user);
  }

  export let data: LayoutData;
</script>

<div>
  <NavBar />
  <slot />
</div>
