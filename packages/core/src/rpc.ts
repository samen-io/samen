export type SamenHeaders = Record<string, string>
export interface SamenReq<THeaders extends SamenHeaders> {
  headers: THeaders
  body: unknown
}

export type SamenNext<T = undefined> = T extends undefined
  ? () => Promise<void>
  : (ctx: T) => Promise<void>

export type SamenMiddleware<
  THeaders extends SamenHeaders = {},
  TCurrentContext = {},
  TNextContext = {}
> = (
  req: SamenReq<THeaders>,
  ctx: TCurrentContext,
  next: SamenNext<TNextContext>,
) => Promise<void>

export interface RPCConfig {
  middleware: SamenMiddleware<any, any, any>[]
  memory?: number
  timeout?: number
}

export interface RPCFunctionConfig {
  rpc: Function | Function[]
  config?: RPCConfig
}

export function rpc(rpc: Function, config?: RPCConfig): RPCFunctionConfig {
  return {
    rpc,
    config,
  }
}

interface IdToken {
  uid: string
  email: string
  claims: {
    isCmsUser: boolean
  }
}

const parseIdToken: SamenMiddleware<
  { authorization: string },
  {},
  { idToken: IdToken }
> = async (req, ctx, next) => {
  const idToken: IdToken = {
    uid: req.headers.authorization.substring("uid".length),
    email: req.headers.authorization.substring("email".length),
    claims: {
      isCmsUser: true,
    },
  }
  await next({ idToken })
}

const requireCmsUser: SamenMiddleware<
  { authorization: string },
  { idToken: IdToken },
  { idToken: IdToken }
> = async (req, ctx, next) => {
  if (!ctx.idToken.claims.isCmsUser) {
    throw new Error("is not cms user")
  }

  await next(ctx)
}

async function listQuestions(
  questionType: "369" | "opendeur",
  offset: string,
  limit: string,
): Promise<string> {
  return "hoi " + questionType + offset + limit
}
export const aad = rpc(listQuestions, {
  middleware: [parseIdToken, requireCmsUser],
  memory: 1024,
})
