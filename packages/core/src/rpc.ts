export type SamenMiddleware<
  Req extends SamenRequest<any, any>,
  Ctx extends Record<string, any>,
  Next extends SamenNext<any>
> =
  | ((req: Req, ctx: Ctx, next: Next) => void | Promise<void>)
  | ((req: Req, next: Next) => void | Promise<void>)

export interface SamenRequest<
  THeaders extends Record<string, string>,
  TPartialBody = {}
> {
  headers: THeaders
  body: TPartialBody
}

export type SamenNext<ContextOut = undefined> = ContextOut extends undefined
  ? () => Promise<void>
  : (ctx: ContextOut) => Promise<void>

export interface RPCOptions {
  middleware?: SamenMiddleware<any, any, any>[]
  config?: RPCConfig
}

export interface RPCConfig {
  memory?: number
  timeout?: number
}

export interface RPCDefinition {
  rpc: Function
  middleware?: SamenMiddleware<any, any, any>[]
  config?: RPCConfig
}

export function rpc(rpc: Function, opts?: RPCOptions): RPCDefinition {
  return {
    rpc,
    middleware: opts?.middleware,
    config: opts?.config,
  }
}

// Results

interface HttpResult {
  statusCode: number
}

class SamenError extends Error {
  constructor(readonly httpResult: HttpResult, message?: string) {
    super(message)
  }
}

const httpResults: Record<string, HttpResult> = {
  badRequest: { statusCode: 400 },
  unauthorized: { statusCode: 401 },
  forbidden: { statusCode: 403 },
  notFound: { statusCode: 404 },
  conflict: { statusCode: 409 },
}

export class BadRequestError extends SamenError {
  constructor(message?: string) {
    super(httpResults.badRequest, message)
  }
}

export class UnauthorizedError extends SamenError {
  constructor(message?: string) {
    super(httpResults.unauthorized, message)
  }
}

export class ForbiddenError extends SamenError {
  constructor(message?: string) {
    super(httpResults.forbidden, message)
  }
}

export class NotFoundError extends SamenError {
  constructor(message?: string) {
    super(httpResults.notFound, message)
  }
}

export class ConflictError extends SamenError {
  constructor(message?: string) {
    super(httpResults.conflict, message)
  }
}
