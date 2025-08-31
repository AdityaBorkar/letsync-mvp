import type { ClientDb, GenericObject } from "@/types/client.js"
import type { SQL_Schemas } from "@/types/schemas.js"

import { generateName } from "../../../utils/generate-name.js"
import { close } from "./close.js"
import { connect } from "./connect.js"
import { dump } from "./dump.js"
import { flush } from "./flush.js"
import { metadata } from "./metadata.js"
import { schema as _schema } from "./schema.js"
import { size } from "./size.js"
import type { DrizzleClientDb_typed } from "./types.js"

export function ClientDB<
  T extends DrizzleClientDb_typed<S>,
  S extends Record<string, unknown>
>(props: { client: T; name?: string }) {
  const { client, name = generateName() } = props

  // TODO: DO NOT ALLOW DIRECT WRITES TO TABLES (IMPLEMENT USING USER ROLES / ACL)

  return {
    __brand: "LETSYNC_CLIENT_DB",
    client,
    close: () => close(client),
    connect: () => connect(client),
    dump: (_: Parameters<typeof dump>[1]) => dump(client, _),
    flush: () => flush(client),
    metadata: {
      get: (key: string) => metadata.get(client, key),
      remove: (key: string) => metadata.remove(client, key),
      set: (key: string, value: string | boolean | GenericObject) =>
        metadata.set(client, key, value)
    },
    name,
    schema: {
      apply: (record: SQL_Schemas.Schema) => _schema.apply(client, record),
      insert: (records: SQL_Schemas.Schema[]) =>
        _schema.insert(client, records),
      list: (aboveVersion?: string) => _schema.list(client, aboveVersion),
      pull: () => _schema.pull(client)
    },
    size: () => size(client)
  } satisfies ClientDb.Adapter<T>
}

// import type { ClientDb, GenericObject } from "@/types/client.js";
// import type { SQL_Schemas } from "@/types/schemas.js";
// import { generateName } from "@/utils/generate-name.js";

// import { close } from "./close.js";
// import { connect } from "./connect.js";
// import { dump } from "./dump.js";
// import { flush } from "./flush.js";
// import { metadata } from "./metadata.js";
// import { schema as _schema } from "./schema.js";
// import { size } from "./size.js";
// import { transformSchema } from "./transform-schema.js";
// import type { DrizzleClientDb_typed } from "./types.js";

// export function createClient<
// 	T extends DrizzleClientDb_typed<S>,
// 	S extends Record<string, unknown>,
// >(
// 	props: { client: T; schema?: S; name?: string },
// 	// wrapper: T,
// 	// // @ts-expect-error - TODO: FIX THIS
// 	// params: Parameters<T>[0] & { name?: string },
// ) {
// 	// // @ts-expect-error - TODO: FIX THIS
// 	// const { name = generateName(), schema, ...args } = params;
// 	// if (schema) {
// 	// 	// @ts-expect-error - TODO: FIX THIS
// 	// 	args.schema = transformSchema(schema);
// 	// }
// 	// // @ts-expect-error - TODO: FIX THIS
// 	// type S = typeof args.schema;
// 	// // @ts-expect-error - TODO: FIX THIS
// 	// const client = wrapper(args) as DrizzleClientDb_typed<S>;

// 	const name = props.name ?? generateName();
// 	const schema = transformSchema(props.schema ?? {});
// 	const client = props.client as DrizzleClientDb_typed<typeof schema>;

// 	type ClientType = T;

// 	// TODO: DO NOT ALLOW DIRECT WRITES TO TABLES (IMPLEMENT USING USER ROLES / ACL)

// 	return {
// 		__brand: "LETSYNC_CLIENT_DB",
// 		client: client as ClientType,
// 		close: () => close(client),
// 		connect: () => connect(client),
// 		dump: (_: Parameters<typeof dump>[1]) => dump(client, _),
// 		flush: () => flush(client),
// 		metadata: {
// 			get: (key: string) => metadata.get(client, key),
// 			remove: (key: string) => metadata.remove(client, key),
// 			set: (key: string, value: string | boolean | GenericObject) =>
// 				metadata.set(client, key, value),
// 		},
// 		name,
// 		schema: {
// 			apply: (record: SQL_Schemas.Schema) => _schema.apply(client, record),
// 			insert: (records: SQL_Schemas.Schema[]) =>
// 				_schema.insert(client, records),
// 			list: (aboveVersion?: string) => _schema.list(client, aboveVersion),
// 			pull: () => _schema.pull(client),
// 		},
// 		size: () => size(client),
// 	} satisfies ClientDb.Adapter<ClientType>;
// }
