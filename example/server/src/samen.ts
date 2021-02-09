import { rpc, SamenMiddleware } from "@samen/samen"

const myMiddleware: SamenMiddleware<
  { authorization: string },
  {},
  undefined
> = async (req, ctx, next) => {
  console.log("hallo? >> " + req.headers.authorization)
  await next()
}

export interface Test {
  x: boolean
}
async function isTestFunc(test: Test): Promise<boolean> {
  return test.x === true
}

export const isTest = rpc(isTestFunc, {
  middleware: [myMiddleware],
  memory: 1024,
  timeout: 3000,
})
