/**
 * Reseed the JSON database from seed-data.js
 * Usage: npm run seed --prefix server
 */
import { resetDb, DB_PATH } from './db.js'

const db = resetDb()
console.log(`Reseeded ${DB_PATH}`)
console.log(`Users: ${db.users.length}, students: ${db.students.length}, lessons: ${db.lessons.length}`)
