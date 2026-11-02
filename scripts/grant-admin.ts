/**
 * Lists users and their roles, or gives one user the `admin` role.
 *
 * Editing products, uploading media etc. is admin-only, and only an admin can
 * change roles in /admin — so an account that predates the `roles` field (or
 * was restored without it) can't fix itself. This uses the Local API, which
 * bypasses access control. Runs against the DB in DATABASE_URL/DATABASE_NAME.
 *
 *   pnpm payload run scripts/grant-admin.ts                         # list
 *   ADMIN_EMAIL=you@example.com pnpm payload run scripts/grant-admin.ts
 */
import config from "@payload-config";
import { getPayload } from "payload";

const payload = await getPayload({ config });
const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();

const { docs: users } = await payload.find({
  collection: "users",
  depth: 0,
  limit: 100,
  pagination: false,
  select: { email: true, roles: true },
});

if (!email) {
  payload.logger.info(
    `Database "${payload.db.connection?.name}" has ${users.length} user(s):`,
  );
  for (const user of users) {
    payload.logger.info(
      `  ${user.email}  roles: ${JSON.stringify(user.roles ?? null)}`,
    );
  }
  payload.logger.info(
    "Set ADMIN_EMAIL=<email> to give one of them the admin role.",
  );
  process.exit(0);
}

const user = users.find((u) => u.email.toLowerCase() === email);
if (!user) {
  payload.logger.error(`No user with email ${email}.`);
  process.exit(1);
}

const roles = Array.from(new Set([...(user.roles ?? []), "admin" as const]));
await payload.update({ collection: "users", id: user.id, data: { roles } });
payload.logger.info(`${user.email} now has roles: ${JSON.stringify(roles)}`);
process.exit(0);
