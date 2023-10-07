import type { RequestEvent } from "@sveltejs/kit"
import type { LayoutServerLoad } from "./$types"

export const load: LayoutServerLoad = async (event: RequestEvent) => {
  return {
    session: await event.locals.getSession()
  }
}
