import sharp from "sharp";
import {
  BoldFeature,
  EXPERIMENTAL_TableFeature,
  IndentFeature,
  ItalicFeature,
  LinkFeature,
  OrderedListFeature,
  UnderlineFeature,
  UnorderedListFeature,
  lexicalEditor,
} from "@payloadcms/richtext-lexical";
import { mongooseAdapter } from "@payloadcms/db-mongodb";
import { buildConfig } from "payload";

import path from "path";
import { fileURLToPath } from "url";

import { Categories } from "@/collections/Categories";
import { Media } from "@/collections/Media";
import { Pages } from "@/collections/Pages";
import { Users } from "@/collections/Users";
import { About } from "@/globals/About";
import { Home } from "@/globals/Home";
import { plugins } from "./src/plugins";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  // If you'd like to use Rich Text, pass your editor here

  admin: {
    user: Users.slug,
  },

  editor: lexicalEditor({
    features: () => {
      return [
        UnderlineFeature(),
        BoldFeature(),
        ItalicFeature(),
        OrderedListFeature(),
        UnorderedListFeature(),
        LinkFeature({
          enabledCollections: ["pages"],
          fields: ({ defaultFields }) => {
            const defaultFieldsWithoutUrl = defaultFields.filter((field) => {
              if ("name" in field && field.name === "url") return false;
              return true;
            });

            return [
              ...defaultFieldsWithoutUrl,
              {
                name: "url",
                type: "text",
                admin: {
                  condition: ({ linkType }) => linkType !== "internal",
                },
                label: ({ t }) => t("fields:enterURL"),
                required: true,
              },
            ];
          },
        }),
        IndentFeature(),
        EXPERIMENTAL_TableFeature(),
      ];
    },
  }),
  // Define and configure your collections in this array
  collections: [Users, Pages, Categories, Media],
  globals: [About, Home],
  db: mongooseAdapter({
    // DATABASE_MONGODB_URI is auto-injected by Vercel's MongoDB Atlas
    // integration in production; DATABASE_URL is used for local dev.
    url: process.env.DATABASE_MONGODB_URI || process.env.DATABASE_URL || "",
    // Connection strings here don't specify a path segment, so Mongo
    // defaults to a database literally named "test". Override via
    // DATABASE_NAME where a real name is wanted (e.g. Vercel prod).
    connectOptions: process.env.DATABASE_NAME
      ? { dbName: process.env.DATABASE_NAME }
      : undefined,
  }),
  // Your Payload secret - should be a complex and secure string, unguessable
  secret: process.env.PAYLOAD_SECRET || "",
  // Whichever Database Adapter you're using should go here
  // Mongoose is shown as an example, but you can also use Postgres

  // If you want to resize images, crop, set focal point, etc.
  // make sure to install it and pass it to the config.
  // This is optional - if you don't need to do these things,
  // you don't need it!
  sharp,
  endpoints: [],
  plugins,
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
});
