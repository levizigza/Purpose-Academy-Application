import fs from 'node:fs'

for (const f of ['src/data/seed.ts', 'server/src/seed-data.js']) {
  let c = fs.readFileSync(f, 'utf8')
  const before = c
  c = c.replace(/[\u201C\u201D]/g, '"').replace(/[\u2018\u2019]/g, "'")
  c = c.replace(/â€œ|â€/g, '"').replace(/â€˜|â€™/g, "'")
  fs.writeFileSync(f, c)
  console.log(f, c === before ? 'unchanged' : 'fixed')
}
