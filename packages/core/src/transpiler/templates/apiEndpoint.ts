import { JSType, RPCFunction, SamenConfig, SamenManifest } from "../../domain"
import {
  generateInputDateConverter,
  generateRefDateConverters,
} from "./shared/dateConverter"
import { parametersFromObject } from "./shared/parameters"
import generateInputValidator from "./shared/validators"

export interface Props {
  rpcFunction: RPCFunction
  manifest: SamenManifest
  relativeSamenFilePath: string
  config: SamenConfig
}

const apiEndpoint = (p: Props) => {
  const models = p.rpcFunction.modelIds
    .map((id) => p.manifest.models[id].ts)
    .join("\n")

  const importSyntax = p.rpcFunction.namespace.length
    ? p.rpcFunction.namespace[0]
    : p.rpcFunction.name

  const importRef = p.rpcFunction.namespace.length
    ? `const ${p.rpcFunction.name} = ${p.rpcFunction.namespace.join(".")}.${
        p.rpcFunction.name
      }`
    : ""

  return `
    import { ${importSyntax} } from '${p.relativeSamenFilePath}';
    
    ${importRef}

    ${models}

    ${generateRefDateConverters(p.manifest)}

    ${generateInputDateConverter(p.rpcFunction, p.manifest)}

    ${generateInputValidator(p.rpcFunction, p.manifest)}

    ${awsHandler(p)}
    
    ${gcHandler(p)}
    
    ${serveHandler(p)}
  `
}

const awsHandler = (p: Props): string => {
  const { name, parameters, returnType } = p.rpcFunction
  const parametersFromBody = parametersFromObject({
    parameters,
    objectName: "body",
  })

  return `
    export async function awsHandler(event: any) {
      const body = JSON.parse(event.body === null || event.body === undefined ? '{}' : event.body)

      const inputValidationResult = validate(${parametersFromBody})

      convertDates(${parametersFromBody})

      if (inputValidationResult.length) {
        return {
          statusCode: 400,
          body: JSON.stringify(new InvalidInputError(inputValidationResult), null, 4),
          headers: {
            "Content-Type": "application/json",
          },
        }
      }

      try {
        const result = await ${name}(${parametersFromBody})

        return {
          statusCode: 200,
          ${
            returnType.type === JSType.untyped
              ? "body: null,"
              : "body: result && JSON.stringify(result, null, 4),"
          }
          headers: {
            "Content-Type": "application/json",
          },
        }
      } catch (e) {
        return {
          statusCode: 500,
          body: JSON.stringify(e, null, 4),
          headers: {
            "Content-Type": "application/json",
          },
        }
      }
    }
  `
}

const gcHandler = (p: Props): string => {
  const {
    rpcFunction: { name, parameters, returnType },
    config: { cors },
  } = p
  const parametersFromBody = parametersFromObject({
    parameters,
    objectName: "body",
  })
  const hasIdTokenParam = parameters.some((p) => p.name === "idToken")

  return `
    const ORIGIN_WHITELIST: string[] = ${
      cors ? JSON.stringify(cors.whitelist) : `[]`
    }
    export async function gcHandler(req: any, res: any) {
      if (!ORIGIN_WHITELIST.includes(req.headers.origin)) {
        res.status(401).end()
        return
      }

      res.set({
        "Access-Control-Allow-Origin": req.headers.origin,
        "Access-Control-Allow-Methods": req.method,
        "Access-Control-Allow-Headers": "content-type, authorization",
      })

      if (req.method === 'OPTIONS') {
        res.end();
        return
      } else if (req.method !== 'POST') {
        res.status(404).end()
        return
      }

      const body = req.body

      ${
        hasIdTokenParam
          ? `
        /// AUTH
        const idTokenString = req.headers['authorization']?.substring('Bearer '.length)
        if (!idTokenString) {
          res.status(401).end();
          return;
        }
        const firebaseAdmin = require('firebase-admin')
        const idToken = await firebaseAdmin.auth().verifyIdToken(idTokenString)
        console.debug(\`Got IdToken \${JSON.stringify(idToken ?? 'NONE')}\`)
        body.idToken = idToken;
        /// AUTH
      `
          : ""
      }

      const inputValidationResult = validate(${parametersFromBody})

      convertDates(${parametersFromBody})

      if (inputValidationResult.length) {
        res.status(400).json(new InvalidInputError(inputValidationResult))
        return
      }

      try {
        const result = await ${name}(${parametersFromBody})
        res.json(${returnType.type === JSType.untyped ? "null" : "result"})
        return
      } catch (e) {
        res.status(500).json(e)
        return
      }
    }
  `
}

const serveHandler = (p: Props): string => {
  const { name, parameters } = p.rpcFunction
  const parametersFromBody = parametersFromObject({
    parameters,
    objectName: "body",
  })
  const hasIdTokenParam = parameters.some((p) => p.name === "idToken")

  return `
    class AuthorizationError extends Error {
      errorCode = 'AUTHORIZATION_ERROR'
      constructor() {
        super('Malformed authorization header')
      }
    }

    export async function serveHandler(req: any) {
      const body = req.body
      ${
        hasIdTokenParam
          ? `
        /// AUTH
        const idTokenString = req.headers['authorization']?.substring('Bearer '.length)
        if (!idTokenString) {
          throw new AuthorizationError()
        }
        const firebaseAdmin = require('firebase-admin')
        const idToken = await firebaseAdmin.auth().verifyIdToken(idTokenString)
        console.debug(\`Got IdToken \${JSON.stringify(idToken ?? 'NONE')}\`)
        body.idToken = idToken;
        /// AUTH
      `
          : ""
      }

      const inputValidationResult = validate(${parametersFromBody})

      convertDates(${parametersFromBody})

      if (inputValidationResult.length) {
        throw new InvalidInputError(inputValidationResult);
      }

      const result = await ${name}(${parametersFromBody})
      return result
    }
  `
}

export default apiEndpoint
