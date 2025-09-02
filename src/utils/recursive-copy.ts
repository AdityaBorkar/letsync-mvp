import { readdir, stat } from "node:fs/promises"
import { join } from "node:path"
import { file, write } from "bun"

export async function recursiveCopy(src: string, dest: string) {
  const files = await readdir(src)
  for await (const name of files) {
    const srcPath = join(src, name)
    const destPath = join(dest, name)
    if ((await stat(srcPath)).isDirectory()) {
      await recursiveCopy(srcPath, destPath)
    } else {
      const content = await file(srcPath).text()
      // TODO: TRANSFORM `content`
      // console.log({ destPath, srcPath })
      await write(destPath, content)
    }
  }
}
