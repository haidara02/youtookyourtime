import type { GlobalConfig } from "payload";

import { adminOnly } from "@/access/adminOnly";
import { publicAccess } from "@/access/publicAccess";

import {
  FixedToolbarFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from "@payloadcms/richtext-lexical";

import { revalidateAbout } from "./hooks/revalidateAbout";

export const About: GlobalConfig = {
  slug: "about",
  access: {
    read: publicAccess,
    update: adminOnly,
  },
  admin: {
    group: "Content",
  },
  fields: [
    {
      name: "description",
      type: "richText",
      editor: lexicalEditor({
        features: ({ rootFeatures }) => [
          ...rootFeatures,
          FixedToolbarFeature(),
          InlineToolbarFeature(),
        ],
      }),
      required: true,
    },
    {
      name: "image",
      type: "upload",
      relationTo: "media",
      required: true,
    },
  ],
  hooks: {
    afterChange: [revalidateAbout],
  },
};
