import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import bcrypt from 'bcryptjs'
import { createSeedDatabase, DEMO_PASSWORDS } from './seed-data.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_DIR = path.join(__dirname, '..', 'data')
const DB_PATH = path.join(DATA_DIR, 'purpose-academy.json')

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
}

function hashPasswords(db) {
  for (const user of db.users) {
    if (!user.password_hash) {
      user.password_hash = bcrypt.hashSync(user.password, 10)
      delete user.password
    }
  }
  return db
}

/** Demo tasks saved before the June 2027 seed. Lift only these exact old dates. */
const STALE_DEMO_DUE = {
  'asg-1': { from: '2026-10-05', to: '2027-06-01' },
  'asg-2': { from: '2026-10-20', to: '2027-06-15' },
}

function liftStaleDemoDueDates(db) {
  let changed = false
  for (const assignment of db.assignments || []) {
    const lift = STALE_DEMO_DUE[assignment.id]
    if (lift && assignment.due_date === lift.from) {
      assignment.due_date = lift.to
      changed = true
    }
  }
  return changed
}

export function loadDb() {
  ensureDir()
  if (!fs.existsSync(DB_PATH)) {
    const seeded = hashPasswords(createSeedDatabase())
    fs.writeFileSync(DB_PATH, JSON.stringify(seeded, null, 2))
    return seeded
  }
  const db = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'))
  if (liftStaleDemoDueDates(db)) saveDb(db)
  return db
}

export function saveDb(db) {
  ensureDir()
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2))
}

export function resetDb() {
  ensureDir()
  const seeded = hashPasswords(createSeedDatabase())
  fs.writeFileSync(DB_PATH, JSON.stringify(seeded, null, 2))
  return seeded
}

export function withDb(mutator) {
  const db = loadDb()
  const result = mutator(db)
  saveDb(db)
  return result
}

export function publicUser(user) {
  if (!user) return null
  const { password_hash, password, ...safe } = user
  return safe
}

export { DEMO_PASSWORDS, DB_PATH }
