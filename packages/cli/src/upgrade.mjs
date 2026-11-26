import { copyFile, mkdir, readFile, rename, rm, rmdir, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { hashFile, LOCK_PACKAGE, LOCK_REGISTRY, projectPath, toPosix } from './lock.mjs'

export const JOURNAL_DIR = '.yam3x'
export const JOURNAL_FILE = 'upgrade-journal.json'
const JOURNAL_SCHEMA_VERSION = 1
const JOURNAL_TEMP = `.upgrade-journal.${process.pid}.tmp`

function compareKeys(a, b) {
  return a < b ? -1 : a > b ? 1 : 0
}

function journalPath(projectRoot) {
  return join(projectRoot, JOURNAL_DIR, JOURNAL_FILE)
}

function isRecord(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function isIntegrity(value) {
  return typeof value === 'string' && value.startsWith('sha256-')
}

function validateJournal(journal) {
  if (!isRecord(journal)) throw new Error('journal must be an object')
  if (journal.schemaVersion !== JOURNAL_SCHEMA_VERSION) {
    throw new Error(`unsupported schemaVersion ${JSON.stringify(journal.schemaVersion)}`)
  }
  if (journal.package !== LOCK_PACKAGE) throw new Error(`package must be ${LOCK_PACKAGE}`)
  if (journal.registry !== LOCK_REGISTRY) throw new Error(`registry must be ${LOCK_REGISTRY}`)
  if (typeof journal.targetVersion !== 'string' || !journal.targetVersion) {
    throw new Error('targetVersion must be a nonempty string')
  }
  if (!Array.isArray(journal.files)) throw new Error('files must be an array')
  for (const file of journal.files) {
    if (!isRecord(file)) throw new Error('journal file must be an object')
    if (typeof file.target !== 'string' || !file.target) {
      throw new Error('journal file target must be a nonempty string')
    }
    if (typeof file.source !== 'string' || !file.source) {
      throw new Error('journal file source must be a nonempty string')
    }
    if (!isIntegrity(file.baseIntegrity) || !isIntegrity(file.targetIntegrity)) {
      throw new Error('journal file integrity must be a sha256- value')
    }
    if (file.kind !== 'apply' && file.kind !== 'conflict') {
      throw new Error('journal file kind must be apply or conflict')
    }
  }
}

export function normalizeJournal(journal) {
  validateJournal(journal)
  return {
    schemaVersion: JOURNAL_SCHEMA_VERSION,
    package: LOCK_PACKAGE,
    registry: LOCK_REGISTRY,
    targetVersion: journal.targetVersion,
    files: [...journal.files]
      .map((file) => ({
        target: file.target,
        source: file.source,
        baseIntegrity: file.baseIntegrity,
        targetIntegrity: file.targetIntegrity,
        kind: file.kind,
      }))
      .sort((a, b) => compareKeys(a.target, b.target)),
  }
}

export async function readJournal(projectRoot) {
  let source
  try {
    source = await readFile(journalPath(projectRoot), 'utf8')
  } catch (error) {
    if (error?.code === 'ENOENT') return undefined
    throw error
  }
  try {
    return normalizeJournal(JSON.parse(source))
  } catch (error) {
    throw new Error(`Invalid ${JOURNAL_DIR}/${JOURNAL_FILE}: ${error.message}`, { cause: error })
  }
}

export async function removeJournal(projectRoot) {
  await rm(journalPath(projectRoot), { force: true })
  try {
    await rmdir(join(projectRoot, JOURNAL_DIR))
  } catch (error) {
    if (error?.code !== 'ENOENT' && error?.code !== 'ENOTEMPTY') throw error
  }
}

export async function writeJournal(projectRoot, journal) {
  const normalized = normalizeJournal(journal)
  if (normalized.files.length === 0) {
    await removeJournal(projectRoot)
    return
  }

  const directory = join(projectRoot, JOURNAL_DIR)
  const path = journalPath(projectRoot)
  const temporary = join(directory, JOURNAL_TEMP)
  await mkdir(directory, { recursive: true })
  try {
    await writeFile(temporary, `${JSON.stringify(normalized, null, 2)}\n`)
    await rename(temporary, path)
  } finally {
    await rm(temporary, { force: true })
  }
}

export function journalFromSource(source, targetVersion) {
  if (typeof targetVersion !== 'string' || !targetVersion) {
    throw new Error('A target version is required.')
  }
  return normalizeJournal({
    schemaVersion: JOURNAL_SCHEMA_VERSION,
    package: LOCK_PACKAGE,
    registry: LOCK_REGISTRY,
    targetVersion,
    files: source.files
      .filter((file) => file.state === 'upstream-only' || file.state === 'conflict')
      .map((file) => ({
        target: file.target,
        source: file.source,
        baseIntegrity: file.baseIntegrity,
        targetIntegrity: file.upstreamIntegrity,
        kind: file.state === 'upstream-only' ? 'apply' : 'conflict',
      })),
  })
}

function setLockBaseline(lock, target, { source, version, integrity }) {
  const entry = lock.files[target]
  if (!entry) throw new Error(`Lock entry is missing for ${target}.`)
  const changed =
    entry.source !== source || entry.version !== version || entry.integrity !== integrity
  entry.source = source
  entry.version = version
  entry.integrity = integrity
  return changed
}

export function resolveLockTarget(lock, file, version) {
  return setLockBaseline(lock, file.target, {
    source: file.source,
    version,
    integrity: file.upstreamIntegrity,
  })
}

export function removeJournalTargets(journal, targets) {
  const removed = new Set(targets.map(toPosix))
  return {
    ...journal,
    files: journal.files.filter((file) => !removed.has(file.target)),
  }
}

export async function recoverJournal({ journal, lock, projectRoot }) {
  const files = []
  let lockChanged = false

  for (const entry of journal.files) {
    const local = await hashFile(projectPath(projectRoot, entry.target))
    if (local && local === entry.targetIntegrity) {
      if (
        setLockBaseline(lock, entry.target, {
          source: entry.source,
          version: journal.targetVersion,
          integrity: entry.targetIntegrity,
        })
      ) {
        lockChanged = true
      }
      continue
    }
    if (local && local === entry.baseIntegrity) {
      files.push(entry)
      continue
    }
    files.push(entry.kind === 'apply' ? { ...entry, kind: 'conflict' } : entry)
  }

  const next = { ...journal, files: files.sort((a, b) => compareKeys(a.target, b.target)) }
  return {
    journal: next,
    lock,
    lockChanged,
    journalChanged: JSON.stringify(next.files) !== JSON.stringify(journal.files),
  }
}

async function copyAtomic(source, target) {
  await mkdir(dirname(target), { recursive: true })
  const temporary = `${target}.yam3x-${process.pid}.tmp`
  try {
    await copyFile(source, temporary)
    await rename(temporary, target)
  } finally {
    await rm(temporary, { force: true })
  }
}

export async function applyJournal({ journal, lock, plan, projectRoot }) {
  const planByTarget = new Map(plan.files.map((file) => [toPosix(file.relativeTarget), file]))
  const files = []
  const applied = []
  let lockChanged = false

  for (const entry of journal.files) {
    const current = planByTarget.get(entry.target)
    const local = await hashFile(projectPath(projectRoot, entry.target))
    if (entry.kind !== 'apply' || !current || local !== entry.baseIntegrity) {
      files.push(entry.kind === 'apply' ? { ...entry, kind: 'conflict' } : entry)
      continue
    }
    await copyAtomic(current.source, current.target)
    if (
      setLockBaseline(lock, entry.target, {
        source: entry.source,
        version: journal.targetVersion,
        integrity: entry.targetIntegrity,
      })
    ) {
      lockChanged = true
    }
    applied.push(entry.target)
  }

  return {
    journal: {
      ...journal,
      files: files.sort((a, b) => compareKeys(a.target, b.target)),
    },
    lock,
    applied,
    lockChanged,
  }
}
