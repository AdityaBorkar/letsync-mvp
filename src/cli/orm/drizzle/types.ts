export interface MigrationJournal {
  version: string
  dialect: string
  entries: {
    idx: number
    version: string
    when: number
    tag: string
    breakpoints: boolean
  }[]
}

export type Config = {
  out: string
  dialect: string
  schema: string
}
