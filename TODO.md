
## WORK-IN-PROGRESS

- #letsync/server/endpoints/getMigration.ts
- #letsync/server/endpoints/sse/getData.ts
- #letsync/server/endpoints/poll/getData.ts

## TODO

- Support Mixed Schema (local and server)
- How to use composite indices?

1. Sync
2. How to code Mutations? (With RSA Support)

- letsync/ws
  - Add token-based authentication for backup option
- letsync
  - Sync strategies for multiple databases
    - store cdc in each database or store cdc in a single database?

## Questions for the future

- How much of the data to sync in the first shot? How to implement incremental sync?
- Write a testing guide in puppeteer/playwright

- How to manage multiple Databases?
- How to manage multiple PubSub Systems?

- Evaluate using WAL approach
- How to use PostgreSQL's logical replication?
- Conflict Resolution
- Sync Strategies - All-Data-at-Once, Incremental / On-Demand
