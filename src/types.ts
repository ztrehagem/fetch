export type RawFetch = WindowOrWorkerGlobalScope["fetch"];

export type PathParams = Record<string, unknown>;

export type QueryValuePrimitive =
  | undefined
  | null
  | boolean
  | number
  | string
  | symbol;
export type QueryValue = QueryValuePrimitive | QueryValuePrimitive[];
export type Query = Record<string, QueryValue>;

export interface RequestInitCustom
  extends Omit<RequestInit, "method" | "body"> {
  headers: Headers;
}

export type MakeBody<T> = T extends void
  ? null
  : (body: T extends void ? null : T) => BodyInit;
