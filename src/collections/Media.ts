import type { CollectionConfig } from "payload";

import {
  FixedToolbarFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from "@payloadcms/richtext-lexical";
import path from "path";

import { adminOnly } from "@/access/adminOnly";
import { publicAccess } from "@/access/publicAccess";
import { fileURLToPath } from "url";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export const Media: CollectionConfig = {
  admin: {
    group: "Content",
  },
  slug: "media",
  access: {
    create: adminOnly,
    delete: adminOnly,
    read: publicAccess,
    update: adminOnly,
  },
  fields: [
    {
      name: "alt",
      type: "text",
      required: true,
    },
    {
      name: "caption",
      type: "richText",
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [
            ...rootFeatures,
            FixedToolbarFeature(),
            InlineToolbarFeature(),
          ];
        },
      }),
    },
    {
      // Still frame shown while a video loads (and if autoplay is blocked,
      // e.g. iOS Low Power Mode).
      name: "poster",
      type: "upload",
      relationTo: "media",
      filterOptions: {
        mimeType: { contains: "image" },
      },
      admin: {
        condition: (data) => Boolean(data?.mimeType?.includes("video")),
        description: "Image shown while the video loads.",
      },
    },
  ],
  upload: {
    staticDir: path.resolve(dirname, "../../public/media"),
  },
};
