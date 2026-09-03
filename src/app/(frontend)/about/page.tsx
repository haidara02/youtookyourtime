import configPromise from "@payload-config";
import { getPayload } from "payload";
import { RichText } from "@payloadcms/richtext-lexical/react";

import { Media } from "@/components/Media";

export default async function AboutPage() {
  const payload = await getPayload({ config: configPromise });

  const about = await payload.findGlobal({
    slug: "about",
    depth: 1,
  });

  return (
    <div className="mx-auto px-4 py-12 sm:px-6 lg:px-8 lg:max-w-9/10">
      <div className="grid gap-12 md:grid-cols-2">
        <div className="flex h-full items-center justify-center">
          <div className="space-y-6 max-w-80">
            <div className="flex gap-4 justify-center">
              {[1, 2, 3].map((i) => (
                <div key={i} className="text-4xl">
                  ♲
                </div>
              ))}
            </div>

            {about.description ? (
              <div className="prose prose-sm text-sm leading-relaxed">
                <RichText data={about.description} />
              </div>
            ) : null}
          </div>
        </div>

        <div className="relative aspect-square bg-gray-100">
          {about.image && typeof about.image !== "string" ? (
            <Media
              resource={about.image}
              imgClassName="h-full w-full object-cover"
              fill
            />
          ) : (
            <div className="flex h-full items-center justify-center text-gray-400">
              Image
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
