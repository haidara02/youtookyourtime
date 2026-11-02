import type { GlobalConfig } from "payload";

import { adminOnly } from "@/access/adminOnly";
import { publicAccess } from "@/access/publicAccess";

import { revalidateHome } from "./hooks/revalidateHome";

export const Home: GlobalConfig = {
  slug: "home",
  access: {
    read: publicAccess,
    update: adminOnly,
  },
  admin: {
    group: "Content",
  },
  fields: [
    {
      name: "heroVideo1",
      type: "upload",
      relationTo: "media",
      filterOptions: {
        mimeType: { contains: "video" },
      },
    },
    {
      name: "heroVideo2",
      type: "upload",
      relationTo: "media",
      filterOptions: {
        mimeType: { contains: "video" },
      },
    },
  ],
  hooks: {
    afterChange: [revalidateHome],
  },
};
