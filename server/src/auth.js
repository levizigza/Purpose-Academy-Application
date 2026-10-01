import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { loadDb, publicUser } from './db.js'

const JWT_SECRET = process.env.JWT_SECRET || 'purpose-academy-dev-secret-change-me'
const JWT_EXPIRES = '7d'

export function signToken(user) {
  return jwt.sign(
    { uid: user.uid, role: user.role, email: user.email, full_name: user.full_name },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES },
  )
}

export function authRequired(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return res.status(401).json({ error: 'Authentication required' })
  try {
    req.user = jwt.verify(token, JWT_SECRET)
    next()
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' })
    }
    next()
  }
}

export function login(email, password) {
  const db = loadDb()
  const user = db.users.find((u) => u.email.toLowerCase() === String(email).trim().toLowerCase())
  if (!user || !user.password_hash) return null
  if (!bcrypt.compareSync(password, user.password_hash)) return null
  return publicUser(user)
}

export function verifyPassword(userRecord, password) {
  return bcrypt.compareSync(password, userRecord.password_hash)
}
