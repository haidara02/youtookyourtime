"use client";

import { RefreshRouteOnSave as PayloadLivePreview } from "@payloadcms/live-preview-react";
import { useRouter } from "next/navigation";
import { useSyncExternalStore } from "react";

const noopSubscribe = () => () => {};

/**
 * Inside the admin's Live Preview pane, re-renders the page (server
 * components re-fetch the draft) whenever the document is saved/autosaved.
 */
export function RefreshRouteOnSave() {
  const router = useRouter();
  // The preview iframe is served from the same origin as the admin, so the
  // current origin is the server URL Payload posts its messages from.
  const origin = useSyncExternalStore(
    noopSubscribe,
    () => window.location.origin,
    () => "",
  );
  if (!origin) return null;
  return <PayloadLivePreview refresh={() => router.refresh()} serverURL={origin} />;
}
