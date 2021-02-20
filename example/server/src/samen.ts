import { SamenRequest, SamenNext, UnauthorizedError, rpc } from "@samen/samen"

export interface IdToken {
  uid: string
  email: string
  claims: {
    isCmsUser: boolean
  }
}

async function parseIdToken(
  req: SamenRequest<{ authorization: string }>,
  next: SamenNext<{ idToken: IdToken }>,
) {
  const uid = req.headers.authorization.substring(0, 100)

  await next({
    idToken: {
      uid,
      email: `${uid}@uid.com`,
      claims: {
        isCmsUser: true,
      },
    },
  })
}

async function requireCMSUser(
  req: SamenRequest<any>,
  ctx: { idToken: IdToken },
  next: SamenNext,
) {
  if (!ctx.idToken.claims.isCmsUser) {
    throw new UnauthorizedError()
  }

  await next()
}

async function getSomeData(id: string): Promise<boolean> {
  return id === "1"
}

async function getSomeAuthorizedData(id: string): Promise<boolean> {
  return id === "2"
}

async function getSomeUserData(token: IdToken, id: string): Promise<boolean> {
  return token.uid === "3" && id === "3"
}

export namespace app.test {
  export const getSome = rpc(getSomeData, {
    config: {
      memory: 1024,
      timeout: 3000,
    },
  })
  // export const getSomeAuthorized = rpc(getSomeAuthorizedData, {
  //   middleware: [parseIdToken, requireCMSUser],
  //   config: {
  //     memory: 1024,
  //     timeout: 3000,
  //   },
  // })
  // export const getSomeUser = rpc(getSomeUserData, {
  //   middleware: [parseIdToken],
  //   config: {
  //     memory: 1024,
  //     timeout: 3000,
  //   },
  // })
}
