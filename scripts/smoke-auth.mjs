/**
 * Smoke-test auth + core API paths against a running server (default :8787).
 * Usage: node scripts/smoke-auth.mjs [baseUrl]
 */
const base = (process.argv[2] || 'http://127.0.0.1:8787').replace(/\/$/, '')

async function req(path, options = {}) {
  const res = await fetch(`${base}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    body: options.json !== undefined ? JSON.stringify(options.json) : options.body,
  })
  const text = await res.text()
  let data
  try {
    data = text ? JSON.parse(text) : null
  } catch {
    data = text
  }
  return { status: res.status, data }
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg)
}

const demos = [
  ['student@purposeacademy.ca', 'student123', 'student', 'approved'],
  ['pending@purposeacademy.ca', 'pending123', 'student', 'pending'],
  ['instructor@purposeacademy.ca', 'instructor123', 'instructor', null],
  ['admin@purposeacademy.ca', 'admin123', 'admin', null],
]

const results = []

try {
  const health = await req('/api/health')
  assert(health.status === 200 && health.data?.ok, `health failed: ${health.status}`)
  results.push('health OK')

  for (const [email, password, role, status] of demos) {
    const login = await req('/api/auth/login', { method: 'POST', json: { email, password } })
    assert(login.status === 200, `login ${email} → ${login.status} ${JSON.stringify(login.data)}`)
    assert(login.data?.token, `login ${email} missing token`)
    assert(login.data?.user?.role === role, `login ${email} role mismatch`)
    if (status) {
      assert(login.data?.student?.registration_status === status, `login ${email} status mismatch`)
    }

    const me = await req('/api/auth/me', {
      headers: { Authorization: `Bearer ${login.data.token}` },
    })
    assert(me.status === 200 && me.data?.user?.email === email, `me failed for ${email}`)

    const state = await req('/api/state', {
      headers: { Authorization: `Bearer ${login.data.token}` },
    })
    assert(state.status === 200 && state.data?.db?.users?.length >= 4, `state failed for ${email}`)
    results.push(`login+me+state OK: ${email}`)
  }

  const email = `smoke-${Date.now()}@example.com`
  const reg = await req('/api/auth/register', {
    method: 'POST',
    json: {
      full_name: 'Smoke Tester',
      email,
      password: 'password123',
      phone: '403-555-0100',
      address: 'Calgary, AB',
      emergency_contact: 'Emergency Contact',
      preferred_language: 'English',
    },
  })
  assert(reg.status === 201 && reg.data?.token, `register failed: ${reg.status} ${JSON.stringify(reg.data)}`)
  assert(reg.data?.student?.registration_status === 'pending', 'new student should be pending')
  results.push(`register OK: ${email}`)

  console.log(results.map((r) => `✓ ${r}`).join('\n'))
  console.log('\nAll auth smoke checks passed.')
} catch (err) {
  console.error('SMOKE FAILED:', err.message)
  process.exit(1)
}
