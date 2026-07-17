import { ObjectId } from "mongodb";
import { AppError } from "@/lib/errors";

export function parseObjectId(id: string, label = "id"): ObjectId {
  if (!ObjectId.isValid(id)) {
    throw AppError.badRequest(`Invalid ${label}`);
  }
  return new ObjectId(id);
}
