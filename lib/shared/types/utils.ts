import type { Treaty } from "@elysiajs/eden";

// @ts-ignore
type TreatyFunction = (...args: any) => Promise<Treaty.TreatyResponse<unknown>>;

export type InferTreatyReturnType<T extends TreatyFunction> = NonNullable<
  Awaited<ReturnType<T>>["data"]
>;

export type InferTreatyInputType<T extends TreatyFunction> = NonNullable<
  Parameters<T>[0]
>;