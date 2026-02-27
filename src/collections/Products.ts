import type { CollectionConfig } from "payload";
// import { generatePreviewPath } from "@/utilities/generatePreviewPath";
import { slugField } from "payload";

export const Products: CollectionConfig = {
  slug: "products",
  admin: {
    useAsTitle: "title",
  },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
    },
    slugField(),

    {
      name: "description",
      type: "richText",
    },

    {
      name: "gallery",
      type: "array",
      minRows: 1,
      fields: [
        {
          name: "image",
          type: "upload",
          relationTo: "media",
          required: true,
        },
      ],
    },

    {
      name: "price",
      type: "number",
      required: true,
    },

    {
      name: "variants",
      type: "array",
      fields: [
        {
          name: "size",
          type: "select",
          options: ["S", "M", "L", "XL"],
        },
        {
          name: "color",
          type: "text",
        },
        {
          name: "inventory",
          type: "number",
        },
      ],
    },

    {
      name: "categories",
      type: "relationship",
      relationTo: "categories",
      hasMany: true,
    },

    {
      name: "relatedProducts",
      type: "relationship",
      relationTo: "products",
      hasMany: true,
    },

    {
      name: "meta",
      type: "group",
      fields: [
        { name: "title", type: "text" },
        { name: "description", type: "textarea" },
        {
          name: "image",
          type: "upload",
          relationTo: "media",
        },
      ],
    },
  ],
};
