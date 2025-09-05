import { join } from "node:path"
import { file } from "bun"

import { ArkErrors, type } from "arktype"

export const SUPPORTED_JOURNAL_VERSION = ["7"]

export async function getJournal(outPath: string) {
  try {
    const path = join(outPath, "meta", "_journal.json")
    const journal = file(path)
    const contents = await journal.json()
    const validated = journalSchema(contents)
    if (validated instanceof ArkErrors) {
      throw new Error(
        `Failed to validate journal file at ${outPath}: ${validated.join("\n")}`
      )
    }
    if (!SUPPORTED_JOURNAL_VERSION.includes(validated.version)) {
      throw new Error(
        `Unsupported journal version: ${validated.version}. Only version ${SUPPORTED_JOURNAL_VERSION} is supported.`
      )
    }
    return validated
  } catch (error) {
    throw new Error(`Failed to read journal file at ${outPath}: ${error}`)
  }
}

const journalSchema = type({
  dialect: "string",
  entries: type(
    {
      breakpoints: "boolean",
      idx: "number",
      tag: "string",
      version: "string",
      when: "number"
    },
    "[]"
  ),
  version: "string"
})
