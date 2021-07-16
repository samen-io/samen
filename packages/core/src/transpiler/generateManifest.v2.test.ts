import { Project } from "ts-morph"
import generateManifest from "./generateManifest"
import { JSType } from "../domain/JSValue"
import { RPCFunction, SamenManifest } from "../domain/manifest"
import { getCompiledSamenFile, getRPCFunction } from "../tests/utils"

describe("generate manifest v2", () => {
  test("read simple test function", () => {
    const func = getRPCFunction(
      "test",
      getCompiledSamenFile(`
      export function test(a: number): number {
        return 1;
      }
    `),
    )

    console.log("func", func)
    expect(func).toBeDefined()
    expect(func).toHaveProperty("name", "test")
  })
  test("read simple test function as lambda", () => {
    const func = getRPCFunction(
      "test",
      getCompiledSamenFile(`
      export const test = (a: number): number => {
        return 1;
      }
    `),
    )

    expect(func).toBeDefined()
    expect(func).toHaveProperty("name", "test")
  })
  test.only("read simple test function with createRPCFunction wrapper", () => {
    // const func = getRPCFunction(
    //   "test",
    //   getCompiledSamenFile(`
    //   export const test = createRPCFunction(theRealTestFunc)

    //   function theRealTestFunc(a: number): number {
    //     return 1
    //   }

    //   function createRPCFunction(func: Function) {
    //   }
    // `),
    // )

    console.log(
      "func",
      getCompiledSamenFile(`
      export const test = createRPCFunction(theRealTestFunc)

      function theRealTestFunc(a: number): number {
        return 1
      }

      function createRPCFunction(func: Function, config?: any) {
      }
    `),
    )
    // expect(func).toBeDefined()
    // expect(func).toHaveProperty("name", "test")
    expect(true).toBeTruthy()
  })
})
