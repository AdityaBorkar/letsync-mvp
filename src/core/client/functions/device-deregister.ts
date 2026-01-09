import type { Context } from "../config.js"

// biome-ignore lint/suspicious/noEmptyInterface: TEMPORARY
interface DeregisterProps {
  // TODO - DE-REGISTER OTHER DEVICES
}

export function DeviceDeregister(_: DeregisterProps, context: Context) {
  context
  // props;
  // const console = new Logger("deregister");
  // const metadata = context.db.get("metadata");
  // const existingDevice = await metadata?.sql`SELECT * FROM client_metadata WHERE key = "device" LIMIT 1`;
  // console.log({ existingDevice: existingDevice?.rows[0] });
  // const data = await context.fetch("DELETE", "/device", {
  // 	searchParams: { deviceId: existingDevice?.deviceId },
  // });
  // console.log({ data });
  // if (!data.ack) {
  // 	throw new Error("Failed to deregister device");
  // }
  // await metadata?.sql`DELETE FROM client_metadata WHERE key = "device"`;
}
