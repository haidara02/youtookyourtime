"use client";

import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";

const noopSubscribe = () => () => {};

/**
 * Shown while draft mode is on, so an admin browsing the real site in the
 * same browser knows they're seeing unpublished changes. Hidden inside the
 * admin's Live Preview pane (an iframe), where it would only get in the way.
 */
export function PreviewBanner() {
  const pathname = usePathname();
  const inIframe = useSyncExternalStore(
    noopSubscribe,
    () => window.self !== window.top,
    () => true,
  );
  if (inIframe) return null;
  return (
    <div className="bg-yellow-100 px-4 py-2 text-center text-sm">
      Previewing unpublished drafts.{" "}
      <a
        href={`/next/exit-preview?path=${encodeURIComponent(pathname)}`}
        className="underline"
      >
        Exit preview
      </a>
    </div>
  );
}
