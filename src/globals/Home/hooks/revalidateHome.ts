import type { GlobalAfterChangeHook } from "payload";

import { revalidatePath } from "next/cache";

export const revalidateHome: GlobalAfterChangeHook = ({
  doc,
  req: { payload, context },
}) => {
  if (!context.disableRevalidate) {
    payload.logger.info("Revalidating home page");

    revalidatePath("/");
  }

  return doc;
};
