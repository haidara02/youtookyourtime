// import { CallToAction } from "@/blocks/CallToAction/config";
// import { Content } from "@/blocks/Content/config";
import { MediaBlock } from "@/blocks/MediaBlock/config";
import { generatePreviewPath } from "@/utilities/generatePreviewPath";
import { CollectionOverride } from "@payloadcms/plugin-ecommerce/types";
import {
  MetaDescriptionField,
  MetaImageField,
  MetaTitleField,
  OverviewField,
  PreviewField,
} from "@payloadcms/plugin-seo/fields";
import {
  FixedToolbarFeature,
  HeadingFeature,
  HorizontalRuleFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from "@payloadcms/richtext-lexical";
import { slugField } from "payload";
import {
  revalidateProduct,
  revalidateProductDelete,
} from "./hooks/revalidateProduct";

export const ProductsCollection: CollectionOverride = ({
  defaultCollection,
}) => ({
  ...defaultCollection,
  admin: {
    ...defaultCollection?.admin,
    defaultColumns: ["title", "priceInVND", "inventory", "_status"],
    livePreview: {
      url: ({ data, req }) =>
        generatePreviewPath({
          slug: data?.slug,
          collection: "products",
          req,
        }),
    },
    preview: (data, { req }) =>
      generatePreviewPath({
        slug: data?.slug as string,
        collection: "products",
        req,
      }),
    useAsTitle: "title",
  },
  defaultPopulate: {
    ...defaultCollection?.defaultPopulate,
    title: true,
    slug: true,
    gallery: true,
    priceInVND: true,
    inventory: true,
    meta: true,
  },
  // Access comes from the ecommerce plugin's defaults via `...defaultCollection`:
  // create/update/delete are admin-only, read is admin or `_status: published`.
  // (Frontend pages use the Local API, which bypasses access control.)
  fields: [
    { name: "title", type: "text", required: true },
    {
      type: "tabs",
      tabs: [
        {
          fields: [
            {
              name: "description",
              type: "richText",
              editor: lexicalEditor({
                features: ({ rootFeatures }) => {
                  return [
                    ...rootFeatures,
                    HeadingFeature({
                      enabledHeadingSizes: ["h1", "h2", "h3", "h4"],
                    }),
                    FixedToolbarFeature(),
                    InlineToolbarFeature(),
                    HorizontalRuleFeature(),
                  ];
                },
              }),
              label: false,
              required: false,
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
              name: "layout",
              type: "blocks",
              // blocks: [CallToAction, Content, MediaBlock],
              blocks: [MediaBlock],
            },
          ],
          label: "Content",
        },
        {
          fields: [
            // Includes inventory, variants, and the plugin's price fields
            // (`priceInVND` + `priceInVNDEnabled`, from the `currencies`
            // config in src/plugins/index.ts).
            ...defaultCollection.fields,
            {
              name: "relatedProducts",
              type: "relationship",
              filterOptions: ({ id }) => {
                if (id) {
                  return {
                    id: {
                      not_in: [id],
                    },
                  };
                }

                // ID comes back as undefined during seeding so we need to handle that case
                return {
                  id: {
                    exists: true,
                  },
                };
              },
              hasMany: true,
              relationTo: "products",
            },
          ],
          label: "Product Details",
        },
        {
          name: "meta",
          label: "SEO",
          fields: [
            OverviewField({
              titlePath: "meta.title",
              descriptionPath: "meta.description",
              imagePath: "meta.image",
            }),
            MetaTitleField({
              hasGenerateFn: true,
            }),
            MetaImageField({
              relationTo: "media",
            }),

            MetaDescriptionField({}),
            PreviewField({
              // if the `generateUrl` function is configured
              hasGenerateFn: true,

              // field paths to match the target field for data
              titlePath: "meta.title",
              descriptionPath: "meta.description",
            }),
          ],
        },
      ],
    },
    {
      name: "categories",
      type: "relationship",
      admin: {
        position: "sidebar",
        sortOptions: "title",
      },
      hasMany: true,
      relationTo: "categories",
    },
    slugField(),
  ],
  hooks: {
    ...defaultCollection.hooks,
    afterChange: [
      ...(defaultCollection.hooks?.afterChange ?? []),
      revalidateProduct,
    ],
    afterDelete: [
      ...(defaultCollection.hooks?.afterDelete ?? []),
      revalidateProductDelete,
    ],
  },
});
