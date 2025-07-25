## TODO:

- Support Mixed Schema (local and server)
- How to use composite indices?

## Think:

- Evaluate using WAL approach
- How to use PostgreSQL's logical replication?
- Conflict Resolution
- Sync Strategies - All-Data-at-Once, Incremental / On-Demand

## WORK-IN-PROGRESS:

- #letsync/server/endpoints/getMigration.ts
- #letsync/server/endpoints/sse/getData.ts
- #letsync/server/endpoints/poll/getData.ts


## Local Development

- To use in your local package (Bun)
    - Run: `cd ../path-to-application-folder/node_modules/react && bun link`
    - Run: `bun link react` (Make sure react is not mentioned in the package.json)
NOTE - I have done the same with react-dom as well, Idk if it's needed.
NOTE - Bun uses symlinks to link packages from global cache.
