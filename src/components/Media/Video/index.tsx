"use client";

import { cn } from "@/utilities/cn";
import { resolveMediaURL } from "@/utilities/getMediaURL";
import React, { useEffect, useRef } from "react";

import type { Props as MediaProps } from "../types";

export const Video: React.FC<MediaProps> = (props) => {
  const { onClick, resource, videoClassName } = props;

  const videoRef = useRef<HTMLVideoElement>(null);
  // const [showFallback] = useState<boolean>()

  useEffect(() => {
    const { current: video } = videoRef;
    if (video) {
      video.addEventListener("suspend", () => {
        // setShowFallback(true);
        // console.warn('Video was suspended, rendering fallback image.')
      });
    }
  }, []);

  if (resource && typeof resource === "object") {
    const { mimeType, poster, url } = resource;
    // Only populated when the doc was fetched with enough depth.
    const posterURL =
      poster && typeof poster === "object" ? resolveMediaURL(poster.url) : "";

    return (
      <video
        autoPlay
        className={cn(videoClassName)}
        controls={false}
        loop
        muted
        onClick={onClick}
        playsInline
        poster={posterURL || undefined}
        ref={videoRef}
      >
        <source src={resolveMediaURL(url)} type={mimeType || undefined} />
      </video>
    );
  }

  return null;
};
