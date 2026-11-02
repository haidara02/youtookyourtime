"use client";

import { useState } from "react";

/** Small "Copy" link for values customers paste into their banking app. */
export function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      aria-label={`Copy ${label}`}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch {
          // Clipboard unavailable (e.g. insecure context): nothing to do.
        }
      }}
      className="ml-2 text-xs text-blue-600 hover:text-blue-800"
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
}
