import { JSType, JSValue, SamenManifest } from "../../../domain"

export const promise = (value: JSValue) => `Promise<${type(value)}>`

export const type = (value: JSValue): string => {
  return typeToString(value)

  function typeToString(value: JSValue): string {
    switch (value.type) {
      case JSType.number:
      case JSType.string:
      case JSType.boolean:
      case JSType.null:
      case JSType.undefined:
        return value.type

      case JSType.ref:
        return value.id

      case JSType.array:
        return `${typeToString(value.elementType)}[]`

      case JSType.tuple:
        return `[${value.elementTypes.map(typeToString).join(", ")}]`

      case JSType.date:
        return "Date"

      case JSType.oneOfTypes:
        return `(${value.oneOfTypes.map(typeToString).join(" | ")})`

      case JSType.object:
        return `{${value.properties
          .map((p) => `${p.name}: ${typeToString(p)}`)
          .join(";")}}`

      case JSType.untyped:
        return "void"
    }
  }
}
