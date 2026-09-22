import { NextResponse } from "next/server";
import { ForbiddenError } from "@/lib/auth/rbac";
import { UnauthenticatedError } from "@/lib/auth/session";
import { ZodError } from "zod";

/**
 * Wraps an API route body so every handler gets the same error mapping.
 * Route handlers should throw rather than construct error responses inline -
 * this keeps authorization failures impossible to accidentally swallow into
 * a 200.
 */
export function apiHandler<Args extends unknown[]>(
  fn: (...args: Args) => Promise<NextResponse>
) {
  return async (...args: Args): Promise<NextResponse> => {
    try {
      return await fn(...args);
    } catch (err) {
      if (err instanceof UnauthenticatedError) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
      }
      if (err instanceof ForbiddenError) {
        return NextResponse.json({ error: err.message }, { status: 403 });
      }
      if (err instanceof ZodError) {
        return NextResponse.json(
          { error: "Validation failed", issues: err.issues },
          { status: 400 }
        );
      }
      if (err instanceof NotFoundError) {
        return NextResponse.json({ error: err.message }, { status: 404 });
      }
      if (err instanceof BadRequestError) {
        return NextResponse.json({ error: err.message }, { status: 400 });
      }
      console.error(err);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  };
}

export class NotFoundError extends Error {
  constructor(message = "Not found") {
    super(message);
    this.name = "NotFoundError";
  }
}

export class BadRequestError extends Error {
  constructor(message = "Bad request") {
    super(message);
    this.name = "BadRequestError";
  }
}
