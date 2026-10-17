import { readFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parse } from 'yaml'

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')

export async function readWorkspaceCatalog() {
  const workspace = parse(await readFile(join(projectRoot, 'pnpm-workspace.yaml'), 'utf8'))
  return workspace.catalog ?? {}
}
