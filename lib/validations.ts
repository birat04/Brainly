import { z } from "zod";

export const signUpSchema = z
  .object({
    email: z.string().email("Invalid email address"),
    username: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .max(20, "Username must be less than 20 characters")
      .regex(
        /^[a-zA-Z0-9_]+$/,
        "Username can only contain letters, numbers, and underscores",
      ),
    fullName: z.string().min(2, "Full name must be at least 2 characters"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const signInSchema = z.object({
  identifier: z.string().min(1, "Email or username is required"),
  password: z.string().min(1, "Password is required"),
});

export const createContentSchema = z
  .object({
    title: z.string().min(1, "Title is required").max(200, "Title is too long"),
    description: z.string().max(500, "Description is too long").optional(),
    type: z.enum(["article", "link", "note", "video", "image"]),
    tags: z.array(z.string()).max(10, "Maximum 10 tags allowed"),
    url: z.string().url("Invalid URL").optional().or(z.literal("")),
    body: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (["link", "video", "image"].includes(data.type)) {
      if (!data.url || data.url === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "URL is required for this type",
          path: ["url"],
        });
      }
    }
  });

export const updateContentSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(500).optional().nullable(),
  type: z.enum(["article", "link", "note", "video", "image"]).optional(),
  tags: z.array(z.string()).max(10).optional(),
  url: z.string().url().optional().nullable().or(z.literal("")),
  body: z.string().optional().nullable(),
});

export const updateProfileSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  username: z
    .string()
    .min(3)
    .max(20)
    .regex(/^[a-zA-Z0-9_]+$/, "Invalid username")
    .optional(),
  bio: z.string().max(200, "Bio is too long").optional(),
  avatar: z.union([z.string().url(), z.literal("")]).optional(),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const deleteAccountSchema = z.object({
  password: z.string().min(1, "Password is required"),
});
