import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import { loadDb } from './db.js'
import { registerRoutes } from './routes.js'
import {
  apiRateLimit,
  authRateLimit,
  requireJsonObject,
  securityHeaders,
} from './security.js'

const PORT = Number(process.env.PORT) || 8787
const ALLOWED_ORIGINS = (process.env.CORS_ORIGINS || 'http://localhost:5173,http://127.0.0.1:5173')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean)

loadDb()

const app = express()
app.disable('x-powered-by')
app.use(securityHeaders)
app.use(
  cors({
    origin(origin, cb) {
      if (!origin || ALLOWED_ORIGINS.includes(origin) || process.env.NODE_ENV !== 'production') {
        return cb(null, true)
      }
      return cb(new Error('CORS origin not allowed'))
    },
    credentials: true,
  }),
)
app.use(express.json({ limit: '64kb' }))
app.use(morgan('dev'))
app.use('/api', apiRateLimit)
app.use('/api/auth/login', authRateLimit)
app.use('/api/auth/register', authRateLimit)
app.use('/api', requireJsonObject)

registerRoutes(app)

app.use((err, _req, res, _next) => {
  console.error(err)
  const message = err?.message === 'CORS origin not allowed' ? err.message : 'Internal server error'
  res.status(err?.message === 'CORS origin not allowed' ? 403 : 500).json({ error: message })
})

app.listen(PORT, () => {
  console.log(`Purpose Academy API listening on http://localhost:${PORT}`)
  console.log('Security: headers, rate limits, input sanitization, prompt-injection guards')
})
