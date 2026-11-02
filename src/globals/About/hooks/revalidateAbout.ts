import type { GlobalAfterChangeHook } from "payload";

import { revalidatePath } from "next/cache";

export const revalidateAbout: GlobalAfterChangeHook = ({
  doc,
  req: { payload, context },
}) => {
  // Skip draft saves/autosaves (Live Preview); only publishing changes the
  // public page.
  if (!context.disableRevalidate && doc._status !== "draft") {
    payload.logger.info("Revalidating about page");

    revalidatePath("/about");
  }

  return doc;
};
