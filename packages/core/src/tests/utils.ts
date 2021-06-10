import { Project } from "ts-morph"
import { generateManifest } from ".."
import { RPCFunction, SamenManifest } from "../domain/manifest"

export function getCompiledSamenFile(tsContent: string): SamenManifest {
  const project = new Project()
  const samenFile = project.createSourceFile("samen.ts", tsContent)
  const manifest = generateManifest(samenFile, project.getTypeChecker())
  return manifest
}

export function getRPCFunction(
  name: string,
  manifest: SamenManifest,
): RPCFunction | undefined {
  return manifest.rpcFunctions.find((f) => f.name === name)
}
