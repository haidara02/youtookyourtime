import { withPayload } from "@payloadcms/next/withPayload";

const NEXT_PUBLIC_SERVER_URL =
  process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    dangerouslyAllowLocalIP: true,
    remotePatterns: [
      // S3_PUBLIC_URL: public R2 media domain (see src/plugins/index.ts).
      ...[NEXT_PUBLIC_SERVER_URL, process.env.S3_PUBLIC_URL]
        .filter((item): item is string => Boolean(item))
        .map((item) => {
          const url = new URL(item);

          return {
            hostname: url.hostname,
            protocol: url.protocol.replace(":", "") as "http" | "https",
          };
        }),
    ],
  },
};

export default withPayload(nextConfig);
