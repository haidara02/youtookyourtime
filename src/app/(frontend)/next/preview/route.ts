import configPromise from "@payload-config";
import { draftMode } from "next/headers";
import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";
import { getPayload } from "payload";

import { checkRole } from "@/access/utilities";

/**
 * Entry point for admin previews (Live Preview pane and the "open preview"
 * button). Enables draft mode — which makes pages render unpublished drafts —
 * only for logged-in admins, then sends them to the requested page.
 */
export async function GET(req: NextRequest) {
  const path = req.nextUrl.searchParams.get("path") ?? "";
  // Same-site paths only, so this can't be used as an open redirect.
  if (!path.startsWith("/") || path.startsWith("//")) {
    return new Response("Invalid preview path", { status: 400 });
  }

  const payload = await getPayload({ config: configPromise });
  const { user } = await payload.auth({ headers: req.headers });
  const draft = await draftMode();

  if (!user || !checkRole(["admin"], user)) {
    draft.disable();
    return new Response("Log in to /admin as an admin to preview drafts.", {
      status: 403,
    });
  }

  draft.enable();
  redirect(path);
}
