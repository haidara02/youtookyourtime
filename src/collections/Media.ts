import type { CollectionConfig } from "payload";

import {
  FixedToolbarFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from "@payloadcms/richtext-lexical";
import path from "path";
import { fileURLToPath } from "url";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export const Media: CollectionConfig = {
  admin: {
    group: "Content",
  },
  slug: "media",
  // access: {
  //   create: adminOnly,
  //   delete: adminOnly,
  //   read: () => true,
  //   update: adminOnly,
  // },
  access: {
    create: () => true, // optional: allow uploads
    read: () => true, // ✅ allow anyone to read media
    update: () => false,
    delete: () => false,
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
  ],
  upload: {
    staticDir: path.resolve(dirname, "../../public/media"),
  },
};
