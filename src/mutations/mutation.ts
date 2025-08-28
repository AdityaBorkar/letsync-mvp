import type { Type } from "arktype"

export interface BaseMutationContext {
  db: any
  env: "client" | "server"
}

export interface MutationContext extends BaseMutationContext {
  session?: {
    user?: {
      id: string
      email?: string
      name?: string
    }
  }
  validatedData?: any
  [key: string]: any
}

export type MutationMiddleware<TInput = any, TContext = MutationContext> = (
  data: TInput,
  context: TContext & {
    setContext: <T extends Partial<TContext>>(updates: T) => void
  }
) => void | Promise<void>

export type MutationHandlerFn<
  TInput = any,
  TContext = MutationContext,
  TResult = any
> = (context: TContext & { data: TInput }) => TResult | Promise<TResult>

type InferArkType<T extends Type> = T extends Type<infer U> ? U : any

interface MutationExecuteResult<T = any> {
  success: boolean
  data?: T
  error?: string
}

function validateWithSchema<T extends Type>(schema: T, data: any) {
  const result = schema(data)
  if (
    result instanceof Error ||
    (result &&
      typeof result === "object" &&
      " arkKind" in result &&
      result[" arkKind"] === "errors")
  ) {
    throw new Error(`Validation failed: ${result.toString()}`)
  }
  return result as InferArkType<T>
}

export class MutationBuilder<
  TData = any,
  TContext extends MutationContext = MutationContext
> {
  public _name = ""
  public _schema?: Type
  public _middlewares: MutationMiddleware<any, any>[] = []
  public _handler?: MutationHandlerFn<TData, TContext>
  public _onSuccess?: (result: { data: any }) => void
  public _onError?: (error: { error: string }) => void
  public _validationCache = new Map<string, any>()

  public env: "client" | "server"
  public db: any
  public fs: any
  public pubsub: any

  constructor(config: {
    env: "client" | "server"
    db: any
    fs: any
    pubsub: any
  }) {
    this.env = config.env
    this.db = config.db
    this.fs = config.fs
    this.pubsub = config.pubsub
  }

  setName(name: string): this {
    this._name = name
    return this
  }

  setParams<TSchema extends Type>(
    schema: TSchema
  ): MutationBuilder<
    InferArkType<TSchema>,
    TContext & { validatedData: InferArkType<TSchema> }
  > {
    this._schema = schema
    return this as any
  }

  middleware<TNewContext extends TContext = TContext>(
    fn: MutationMiddleware<TData, TContext>
  ): MutationBuilder<TData, TNewContext> {
    this._middlewares.push(fn)
    return this as any
  }

  handler<TResult = any>(
    fn: MutationHandlerFn<TData, TContext, TResult>
  ): this {
    this._handler = fn
    return this
  }

  onSuccess(fn: (result: { data: any }) => void): this {
    this._onSuccess = fn
    return this
  }

  onError(fn: (error: { error: string }) => void): this {
    this._onError = fn
    return this
  }

  async execute(
    data: TData,
    options?: { env?: "client" | "server"; context?: Partial<TContext> }
  ): Promise<MutationExecuteResult> {
    try {
      const env =
        options?.env || (typeof window !== "undefined" ? "client" : "server")

      const context = {
        // db: await getDatabase(env),
        env,
        ...options?.context
      } as TContext

      const contextWithSetter = {
        ...context,
        setContext: <T extends Partial<TContext>>(updates: T) => {
          Object.assign(context, updates)
        }
      }

      if (this._schema && data !== undefined) {
        const cacheKey = JSON.stringify(data)
        let validatedData = this._validationCache.get(cacheKey)

        if (!validatedData) {
          validatedData = await validateWithSchema(this._schema, data)
          this._validationCache.set(cacheKey, validatedData)
        }

        contextWithSetter.setContext({ validatedData } as any)
      }

      for await (const middleware of this._middlewares) {
        await middleware(data, contextWithSetter)
      }

      if (!this._handler) {
        throw new Error(`No handler defined for mutation: ${this._name}`)
      }

      const result = await this._handler({ ...context, data })
      this._onSuccess?.({ data: result })
      return { data: result, success: true }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error)
      this._onError?.({ error: errorMessage })
      return { error: errorMessage, success: false }
    }
  }
}

export type MutationChain<
  TData = any,
  TContext extends MutationContext = MutationContext
> = MutationBuilder<TData, TContext>
