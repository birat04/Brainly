import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { AppError } from "@/lib/errors";

type SuccessBody = Record<string, unknown>;

export function ok(body: SuccessBody = {}, status = 200) {
  return NextResponse.json({ success: true, ...body }, { status });
}

export function created(body: SuccessBody = {}) {
  return ok(body, 201);
}

export function fail(error: unknown) {
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        success: false,
        message: error.message,
        code: error.code,
        ...(error.details !== undefined ? { errors: error.details } : {}),
      },
      { status: error.status },
    );
  }

  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        success: false,
        message: "Validation error",
        code: "VALIDATION_ERROR",
        errors: error.flatten(),
      },
      { status: 400 },
    );
  }

  console.error("Unhandled route error", error);
  return NextResponse.json(
    {
      success: false,
      message: "Internal server error",
      code: "INTERNAL_ERROR",
    },
    { status: 500 },
  );
}

export async function handleRoute(fn: () => Promise<NextResponse>) {
  try {
    return await fn();
  } catch (error) {
    return fail(error);
  }
}
