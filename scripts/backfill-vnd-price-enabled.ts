/**
 * One-off backfill after moving `priceInVND` from a hand-rolled Products field
 * to the ecommerce plugin's currency fields (see `currencies` in
 * src/plugins/index.ts).
 *
 * The plugin only shows the price input in the admin when the sibling
 * `priceInVNDEnabled` checkbox is ticked. Existing products have a
 * `priceInVND` value but no checkbox value, so their price would look missing
 * in /admin. This ticks the checkbox wherever a price already exists, on both
 * the main docs and their draft versions (the admin edits the latest version).
 *
 * Safe to run more than once. Run against the DB in DATABASE_URL with:
 *   pnpm payload run scripts/backfill-vnd-price-enabled.ts
 */
import config from "@payload-config";
import { getPayload } from "payload";

const payload = await getPayload({ config });

const products = payload.db.collections["products"];
const versions = payload.db.versions["products"];

const docs = await products.updateMany(
  { priceInVND: { $ne: null }, priceInVNDEnabled: { $ne: true } },
  { $set: { priceInVNDEnabled: true } },
);

const drafts = await versions.updateMany(
  {
    "version.priceInVND": { $ne: null },
    "version.priceInVNDEnabled": { $ne: true },
  },
  { $set: { "version.priceInVNDEnabled": true } },
);

payload.logger.info(
  `priceInVNDEnabled backfill: ${docs.modifiedCount} products, ${drafts.modifiedCount} versions updated`,
);

process.exit(0);
