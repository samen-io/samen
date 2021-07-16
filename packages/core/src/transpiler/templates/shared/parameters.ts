import { JSType } from "../../../domain"
import { RPCFunctionParameter, SamenManifest } from "../../../domain/manifest"
import { type } from "./types"

interface Props {
  parameters: RPCFunctionParameter[]
}

export const typedParameters = ({ parameters }: Props): string =>
  parameters
    .map((p) => {
      if (p.value.type === JSType.oneOfTypes) {
        const undefinedIndex = p.value.oneOfTypes.findIndex(
          (oneType) => oneType.type === JSType.undefined,
        )
        if (undefinedIndex !== -1) {
          const otherTypes = p.value.oneOfTypes.filter(
            (o, i) => i !== undefinedIndex,
          )
          return `${p.name}?: ${type({
            type: JSType.oneOfTypes,
            oneOfTypes: otherTypes,
          })}`
        }
      }
      return `${p.name}: ${type(p.value)}`
    })
    .join(", ")

export const untypedParameters = ({ parameters }: Props): string =>
  parameters.map((p) => p.name).join(", ")

export const parametersFromObject = ({
  parameters,
  objectName,
}: Props & { objectName: string }): string =>
  parameters.map((p) => `${objectName}.${p.name}`).join(", ")
