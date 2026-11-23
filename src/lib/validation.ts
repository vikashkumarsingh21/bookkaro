import { ZodSchema } from "zod";
import { BadRequestError } from "./errors";

export async function validateBody<T>(
  schema: ZodSchema<T>,
  request: Request
): Promise<T> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    throw new BadRequestError("Invalid JSON body received", "INVALID_JSON");
  }

  return schema.parse(body);
}

export function validateQuery<T>(
  schema: ZodSchema<T>,
  request: Request
): T {
  const { searchParams } = new URL(request.url);
  const queryObj: Record<string, string | string[]> = {};

  searchParams.forEach((value, key) => {
    if (queryObj[key]) {
      if (Array.isArray(queryObj[key])) {
        (queryObj[key] as string[]).push(value);
      } else {
        queryObj[key] = [queryObj[key] as string, value];
      }
    } else {
      queryObj[key] = value;
    }
  });

  return schema.parse(queryObj);
}

export function validateParams<T>(
  schema: ZodSchema<T>,
  params: unknown
): T {
  return schema.parse(params);
}
