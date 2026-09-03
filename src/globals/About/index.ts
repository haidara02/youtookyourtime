import type { GlobalConfig } from "payload";

import {
  FixedToolbarFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from "@payloadcms/richtext-lexical";

import { revalidateAbout } from "./hooks/revalidateAbout";

export const About: GlobalConfig = {
  slug: "about",
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
