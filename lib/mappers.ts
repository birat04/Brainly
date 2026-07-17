import { ObjectId } from "mongodb";

export function mapUser(doc: Record<string, unknown>) {
  const { _id, password, ...rest } = doc;
  void password;
  return {
    id: String(_id),
    ...rest,
    createdAt: rest.createdAt instanceof Date ? rest.createdAt.toISOString() : rest.createdAt,
    updatedAt: rest.updatedAt instanceof Date ? rest.updatedAt.toISOString() : rest.updatedAt,
  };
}

export function mapContent(doc: Record<string, unknown>) {
  const { _id, userId, workspaceId, createdBy, ...rest } = doc;
  return {
    id: String(_id),
    userId: userId instanceof ObjectId ? userId.toString() : String(userId),
    workspaceId:
      workspaceId instanceof ObjectId
        ? workspaceId.toString()
        : workspaceId
          ? String(workspaceId)
          : undefined,
    createdBy:
      createdBy instanceof ObjectId
        ? createdBy.toString()
        : createdBy
          ? String(createdBy)
          : undefined,
    ...rest,
    createdAt: rest.createdAt instanceof Date ? rest.createdAt.toISOString() : rest.createdAt,
    updatedAt: rest.updatedAt instanceof Date ? rest.updatedAt.toISOString() : rest.updatedAt,
  };
}
