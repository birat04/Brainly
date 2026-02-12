import { body } from "express-validator";

export const createContentValidation = [
  body("title").isString().trim().notEmpty(),
  body("link").isString().isLength({ min: 5 }),
  body("type").isIn(["video", "article", "image"]),
];

