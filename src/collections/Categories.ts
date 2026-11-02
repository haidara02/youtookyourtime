import { slugField } from "payload";
import type { CollectionConfig } from "payload";

import { adminOnly } from "@/access/adminOnly";
import { publicAccess } from "@/access/publicAccess";

export const Categories: CollectionConfig = {
  slug: "categories",
  access: {
    create: adminOnly,
    delete: adminOnly,
    read: publicAccess,
    update: adminOnly,
  },
  admin: {
    useAsTitle: "title",
    group: "Content",
  },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
    },
    slugField({
      position: undefined,
    }),
  ],
};
