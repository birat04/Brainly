import { body } from "express-validator";

export const signupValidation = [
  body("username")
    .isString()
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage("Username must be 3-30 characters"),
  body("password")
    .isString()
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
];

export const signinValidation = [
  body("username").isString().trim().notEmpty(),
  body("password").isString().notEmpty(),
];

