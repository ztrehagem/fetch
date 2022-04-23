import {
  RawFetch,
  MakeBody,
  PathParams,
  Query,
  RequestInitCustom,
} from "./types";

export class Fetch<
  P extends PathParams | void,
  Q extends Query | void,
  B,
  R extends Response
> {
  private readonly fetch: RawFetch;
  private readonly method: string;
  private readonly path: string;
  private readonly base: URL;
  private readonly makeBody: MakeBody<B>;

  readonly requestInit: RequestInitCustom = {
    headers: new Headers(),
  };

  constructor(
    method: string,
    path: string,
    base: URL,
    makeBody: MakeBody<B>,
    options: { fetch?: RawFetch } = {}
  ) {
    this.method = method;
    this.path = path;
    // remove leading slash
    if (this.path.startsWith("/")) {
      this.path = this.path.slice(1);
    }
    this.base = new URL(base);
    // add trailing slash
    if (!this.base.pathname.endsWith("/")) {
      this.base.pathname += "/";
    }
    this.makeBody = makeBody;
    this.fetch = options.fetch ?? ((...args) => fetch(...args));
  }

  async perform(
    params: P extends void ? null : P,
    query: Q extends void ? null : Q,
    body: B extends void ? null : B
  ): Promise<R> {
    const url = this.makeUrl(params, query);

    const response = await this.fetch(url.toString(), {
      method: this.method,
      body: this.makeBody?.(body),
      ...this.requestInit,
    });

    return response as R;
  }

  protected makeUrl(params: PathParams | null, query: Query | null): URL {
    let uri = this.path;

    for (const [key, value] of Object.entries(params ?? {})) {
      uri = uri.replace(`{${key}}`, String(value));
    }

    const url = new URL(uri, this.base);

    if (query) {
      this.makeSearchParams(url.searchParams, query);
    }

    return url;
  }

  protected makeSearchParams(
    searchParams: URLSearchParams,
    query: Query
  ): void {
    for (const [key, item] of Object.entries(query)) {
      for (const value of [item].flat()) {
        const nonNullValue = value == null ? "" : value;
        searchParams.append(key, String(nonNullValue));
      }
    }
  }
}
