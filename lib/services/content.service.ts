import { AppError } from "@/lib/errors";
import { mapContent } from "@/lib/mappers";
import { parseObjectId } from "@/lib/object-id";
import { contentsCollection, usersCollection } from "@/lib/repos/collections";
import type { ContentDoc } from "@/lib/repos/types";
import { generateShareId } from "@/lib/auth";
import { requireWorkspaceMember } from "@/lib/services/workspace.service";
import { escapeRegex } from "@/lib/utils";
import type { ContentType } from "@/types";
import type { Filter } from "mongodb";

function contentScope(userId: string, workspaceId: string): Filter<ContentDoc> {
  const uid = parseObjectId(userId, "userId");
  const wid = parseObjectId(workspaceId, "workspaceId");
  // Dual-read: prefer workspace, include legacy user-owned rows without workspaceId
  return {
    $or: [{ workspaceId: wid }, { userId: uid, workspaceId: { $exists: false } }],
  };
}

async function assertCanAccessContent(userId: string, workspaceId: string, contentId: string) {
  await requireWorkspaceMember(userId, workspaceId, "member");
  const contents = await contentsCollection();
  const doc = await contents.findOne({
    _id: parseObjectId(contentId),
    ...contentScope(userId, workspaceId),
  });
  if (!doc) throw AppError.notFound("Content not found");
  return doc;
}

export async function listContent(params: {
  userId: string;
  workspaceId: string;
  type?: string | null;
  search?: string | null;
}) {
  await requireWorkspaceMember(params.userId, params.workspaceId, "member");
  const contents = await contentsCollection();
  const scope = contentScope(params.userId, params.workspaceId);
  const typeClause =
    params.type && params.type !== "all" ? ({ type: params.type as ContentType } as Filter<ContentDoc>) : null;
  const q = params.search?.trim();

  async function runRegexSearch() {
    const clauses: Filter<ContentDoc>[] = [scope];
    if (typeClause) clauses.push(typeClause);
    if (q) {
      const rx = { $regex: escapeRegex(q), $options: "i" };
      clauses.push({
        $or: [{ title: rx }, { description: rx }, { body: rx }, { tags: rx }],
      } as Filter<ContentDoc>);
    }
    return contents.find({ $and: clauses }).sort({ createdAt: -1 }).toArray();
  }

  let docs;
  if (q && q.length >= 3) {
    try {
      const clauses: Filter<ContentDoc>[] = [scope, { $text: { $search: q } } as Filter<ContentDoc>];
      if (typeClause) clauses.push(typeClause);
      docs = await contents
        .find({ $and: clauses }, { projection: { score: { $meta: "textScore" } } })
        .sort({ score: { $meta: "textScore" }, createdAt: -1 })
        .toArray();
    } catch {
      docs = await runRegexSearch();
    }
  } else {
    docs = await runRegexSearch();
  }

  return docs.map((d) => mapContent(d as unknown as Record<string, unknown>));
}

export async function createContent(params: {
  userId: string;
  workspaceId: string;
  title: string;
  description?: string;
  type: ContentType;
  tags: string[];
  url?: string;
  body?: string;
}) {
  const { assertCanCreateContent } = await import("@/lib/services/billing.service");
  await assertCanCreateContent(params.userId, params.workspaceId);
  const contents = await contentsCollection();
  const uid = parseObjectId(params.userId, "userId");
  const wid = parseObjectId(params.workspaceId, "workspaceId");
  const now = new Date();

  const doc: Omit<ContentDoc, "_id"> = {
    userId: uid,
    workspaceId: wid,
    createdBy: uid,
    title: params.title,
    description: params.description ?? null,
    type: params.type,
    tags: params.tags,
    url: params.url || null,
    body: params.body ?? null,
    shareId: null,
    isPublic: false,
    viewCount: 0,
    createdAt: now,
    updatedAt: now,
  };

  const result = await contents.insertOne(doc as ContentDoc);
  return mapContent({ _id: result.insertedId, ...doc });
}

export async function getContentById(userId: string, workspaceId: string, id: string) {
  const doc = await assertCanAccessContent(userId, workspaceId, id);
  return mapContent(doc as unknown as Record<string, unknown>);
}

export async function updateContent(
  userId: string,
  workspaceId: string,
  id: string,
  patch: Partial<{
    title: string;
    description: string | null;
    type: ContentType;
    tags: string[];
    url: string | null;
    body: string | null;
  }>,
) {
  await assertCanAccessContent(userId, workspaceId, id);
  const contents = await contentsCollection();
  await contents.updateOne(
    { _id: parseObjectId(id) },
    { $set: { ...patch, updatedAt: new Date() } },
  );
  const updated = await contents.findOne({ _id: parseObjectId(id) });
  return mapContent(updated as unknown as Record<string, unknown>);
}

export async function deleteContent(userId: string, workspaceId: string, id: string) {
  await assertCanAccessContent(userId, workspaceId, id);
  const contents = await contentsCollection();
  await contents.deleteOne({ _id: parseObjectId(id) });
}

export async function createShareLink(userId: string, workspaceId: string, id: string) {
  const content = await assertCanAccessContent(userId, workspaceId, id);
  const contents = await contentsCollection();
  let shareId = content.shareId;
  if (!shareId) {
    shareId = generateShareId();
    await contents.updateOne(
      { _id: content._id },
      { $set: { shareId, isPublic: true, updatedAt: new Date() } },
    );
  } else if (!content.isPublic) {
    await contents.updateOne(
      { _id: content._id },
      { $set: { isPublic: true, updatedAt: new Date() } },
    );
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return { shareId, url: `${baseUrl}/brain/${shareId}`, isPublic: true };
}

export async function patchShare(
  userId: string,
  workspaceId: string,
  id: string,
  body: { isPublic: boolean; revoke?: boolean },
) {
  const content = await assertCanAccessContent(userId, workspaceId, id);
  const contents = await contentsCollection();

  if (body.revoke) {
    await contents.updateOne(
      { _id: content._id },
      { $set: { shareId: null, isPublic: false, updatedAt: new Date() } },
    );
  } else {
    const update: Record<string, unknown> = { isPublic: body.isPublic, updatedAt: new Date() };
    if (body.isPublic && !content.shareId) {
      update.shareId = generateShareId();
    }
    await contents.updateOne({ _id: content._id }, { $set: update });
  }

  const updated = await contents.findOne({ _id: content._id });
  return mapContent(updated as unknown as Record<string, unknown>);
}

export async function listSharedContent(userId: string, workspaceId: string) {
  await requireWorkspaceMember(userId, workspaceId, "member");
  const contents = await contentsCollection();
  const docs = await contents
    .find({
      $and: [contentScope(userId, workspaceId), { shareId: { $exists: true, $ne: null } }],
    })
    .sort({ updatedAt: -1 })
    .toArray();
  return docs.map((d) => mapContent(d as unknown as Record<string, unknown>));
}

export async function getPublicByShareId(shareId: string) {
  const contents = await contentsCollection();
  const content = await contents.findOne({ shareId, isPublic: true });
  if (!content) throw AppError.notFound("Content not found or not public");

  await contents.updateOne({ _id: content._id }, { $inc: { viewCount: 1 } });

  const users = await usersCollection();
  const author = await users.findOne(
    { _id: content.userId },
    { projection: { password: 0, email: 0 } },
  );

  return {
    id: String(content._id),
    title: content.title,
    description: content.description,
    type: content.type,
    tags: content.tags,
    url: content.url,
    body: content.body,
    isPublic: true,
    shareId: content.shareId,
    viewCount: content.viewCount + 1,
    createdAt:
      content.createdAt instanceof Date ? content.createdAt.toISOString() : String(content.createdAt),
    updatedAt:
      content.updatedAt instanceof Date ? content.updatedAt.toISOString() : String(content.updatedAt),
    author: author
      ? {
          username: author.username,
          fullName: author.fullName,
          avatar: author.avatar,
        }
      : null,
  };
}

export async function getWorkspaceStats(userId: string, workspaceId: string) {
  await requireWorkspaceMember(userId, workspaceId, "member");
  const contents = await contentsCollection();
  const scope = contentScope(userId, workspaceId);

  const [totalContent, sharedContent, viewsAgg] = await Promise.all([
    contents.countDocuments(scope),
    contents.countDocuments({ $and: [scope, { isPublic: true }] }),
    contents
      .aggregate<{ total: number }>([
        { $match: scope },
        { $group: { _id: null, total: { $sum: "$viewCount" } } },
      ])
      .toArray(),
  ]);

  const { getBillingStatus } = await import("@/lib/services/billing.service");
  const billing = await getBillingStatus(userId, workspaceId);

  return {
    totalContent,
    sharedContent,
    totalViews: viewsAgg[0]?.total ?? 0,
    plan: billing.plan,
    contentLimit: billing.usage.contentLimit,
    pastDue: billing.pastDue,
  };
}
