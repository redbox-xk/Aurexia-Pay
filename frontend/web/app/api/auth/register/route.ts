import { neon } from '@neondatabase/serverless'
import crypto from 'crypto'

const sql = neon(process.env.DATABASE_URL!)

// Simple password hashing (use bcrypt in production)
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex')
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password, full_name } = body

    if (!email || !password) {
      return Response.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Check if user exists
    const existing = await sql`SELECT id FROM users WHERE email = ${email}`
    if (existing.length > 0) {
      return Response.json(
        { success: false, error: 'User already exists' },
        { status: 409 }
      )
    }

    const passwordHash = hashPassword(password)

    const [user] = await sql`
      INSERT INTO users (email, password_hash, full_name, status)
      VALUES (${email}, ${passwordHash}, ${full_name || null}, 'active')
      RETURNING id, email, full_name, role, status, created_at
    `

    // Log the event
    await sql`
      INSERT INTO audit_log (user_id, event_type, resource_type, resource_id, metadata)
      VALUES (${user.id}, 'user.registered', 'user', ${user.id}, ${JSON.stringify({ email })})
    `

    return Response.json({ 
      success: true, 
      data: user 
    })
  } catch (error) {
    console.error('[v0] Error registering user:', error)
    return Response.json(
      { success: false, error: 'Failed to register user' },
      { status: 500 }
    )
  }
}
