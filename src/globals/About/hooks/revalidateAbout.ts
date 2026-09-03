import type { GlobalAfterChangeHook } from "payload";

import { revalidatePath } from "next/cache";

export const revalidateAbout: GlobalAfterChangeHook = ({
  doc,
  req: { payload, context },
}) => {
  if (!context.disableRevalidate) {
    payload.logger.info("Revalidating about page");

    revalidatePath("/about");
  }

  return doc;
};
