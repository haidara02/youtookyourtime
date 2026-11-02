import configPromise from "@payload-config";
import { draftMode } from "next/headers";
import { getPayload } from "payload";
import { Media } from "@/components/Media";
import { RichText } from "@/components/RichText";
import { RefreshRouteOnSave } from "@/components/LivePreview/RefreshRouteOnSave";

export default async function AboutPage() {
  const payload = await getPayload({ config: configPromise });
  // On only for admins previewing (see /next/preview): show the latest draft.
  const { isEnabled: draft } = await draftMode();

  const about = await payload.findGlobal({
    slug: "about",
    depth: 1,
    draft,
  });

  return (
    <div className="mx-auto px-4 py-12 sm:px-6 lg:px-8 lg:max-w-9/10">
      {draft ? <RefreshRouteOnSave /> : null}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="flex h-full items-center justify-center">
          <div className="space-y-6">
            <div className="flex gap-4 justify-center">
              {[1, 2, 3].map((i) => (
                <div key={i} className="text-4xl">
                  ♲
                </div>
              ))}
            </div>

            {about.description ? (
              <RichText
                data={about.description}
                className="text-2xl font-bold leading-relaxed"
              />
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
