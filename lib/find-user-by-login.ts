import type { Collection, Document } from "mongodb";
import { escapeRegex } from "@/lib/utils";

/**
 * Find a user document by email or username (handles casing and light whitespace in DB).
 */
export async function findUserByLogin(
  users: Collection<Document>,
  identifier: string,
): Promise<Document | null> {
  const idRaw = identifier.trim();
  const idLower = idRaw.toLowerCase();

  if (idRaw.includes("@")) {
    let user = await users.findOne({ email: idLower });
    if (!user) user = await users.findOne({ email: idRaw });
    if (!user) {
      user = await users.findOne({
        $expr: {
          $eq: [
            { $toLower: { $trim: { input: { $ifNull: ["$email", ""] } } } },
            idLower,
          ],
        },
      });
    }
    return user;
  }

  let user = await users.findOne({ username: idRaw });
  if (!user) user = await users.findOne({ username: idLower });
  if (!user) {
    user = await users.findOne({
      $expr: {
        $eq: [
          { $toLower: { $trim: { input: { $ifNull: ["$username", ""] } } } },
          idLower,
        ],
      },
    });
  }
  if (!user) {
    const esc = escapeRegex(idRaw);
    user = await users.findOne({ username: { $regex: new RegExp(`^${esc}$`, "i") } });
  }
  return user;
}
