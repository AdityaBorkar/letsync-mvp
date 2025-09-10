import type { Client } from "pg"

// SELECT * FROM pg_create_logical_replication_slot('my_slot', 'wal2json');
// pg_recvlogical -d mydb --slot=my_slot --start -f -
// await pg.query("START_REPLICATION SLOT my_slot LOGICAL 0/0")
// pg.on("copyData", (chunk) => {
//   const msg = chunk.toString("utf8")
//   wss.clients.forEach((ws) => ws.send(msg))
// })

export async function setupWAL(pg: Client) {
  // Enable logical replication
  await pg.query(`
    ALTER SYSTEM SET wal_level = logical;
    ALTER SYSTEM SET max_replication_slots = 10;
    ALTER SYSTEM SET max_wal_senders = 10;
  `)
  await pg.query("SELECT pg_reload_conf()")

  // Create publication for all tables
  await pg.query("CREATE PUBLICATION sync_pub FOR ALL TABLES")

  // Create replication slot with wal2json
  await pg.query(`
    SELECT pg_create_logical_replication_slot('letsync_slot', 'wal2json')
  `)
}
