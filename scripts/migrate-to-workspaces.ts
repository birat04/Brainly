/**
 * Backfill personal workspaces + content.workspaceId for existing users.
 *
 * Usage:
 *   npx tsx scripts/migrate-to-workspaces.ts
 *   npx tsx scripts/migrate-to-workspaces.ts --dry-run
 */
import { MongoClient, ObjectId } from "mongodb";

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/cortexly";
const dryRun = process.argv.includes("--dry-run");

function slugify(base: string): string {
  const cleaned = base
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
  return cleaned || "workspace";
}

async function main() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db("cortexly");

  const users = db.collection("users");
  const workspaces = db.collection("workspaces");
  const memberships = db.collection("memberships");
  const contents = db.collection("contents");

  const allUsers = await users.find({}).toArray();
  console.log(`Users: ${allUsers.length}${dryRun ? " (dry-run)" : ""}`);

  let createdWorkspaces = 0;
  let stampedContent = 0;

  for (const user of allUsers) {
    const userId = user._id as ObjectId;
    const username = String(user.username || "user");

    let membership = await memberships.findOne({ userId });
    let workspaceId: ObjectId;

    if (!membership) {
      let slug = slugify(username);
      let n = 0;
      while (await workspaces.findOne({ slug })) {
        n += 1;
        slug = `${slugify(username)}-${n}`;
      }

      const now = new Date();
      if (dryRun) {
        console.log(`[dry-run] would create workspace for ${username} slug=${slug}`);
        workspaceId = new ObjectId();
        createdWorkspaces += 1;
      } else {
        const ws = await workspaces.insertOne({
          name: `${username}'s workspace`,
          slug,
          ownerId: userId,
          plan: "free",
          createdAt: now,
          updatedAt: now,
        });
        workspaceId = ws.insertedId;
        await memberships.insertOne({
          userId,
          workspaceId,
          role: "owner",
          createdAt: now,
          updatedAt: now,
        });
        createdWorkspaces += 1;
      }
    } else {
      workspaceId = membership.workspaceId as ObjectId;
    }

    const legacyFilter = { userId, workspaceId: { $exists: false } };
    const count = await contents.countDocuments(legacyFilter);
    if (count > 0) {
      if (dryRun) {
        console.log(`[dry-run] would stamp ${count} content docs for ${username}`);
      } else {
        const result = await contents.updateMany(legacyFilter, {
          $set: { workspaceId, createdBy: userId },
        });
        stampedContent += result.modifiedCount;
      }
    }
  }

  console.log(`Created workspaces: ${createdWorkspaces}`);
  console.log(`Stamped content: ${stampedContent}`);
  await client.close();
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
