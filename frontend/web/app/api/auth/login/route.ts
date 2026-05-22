import { neon } from '@neondatabase/serverless'
import { Redis } from '@upstash/redis'
import crypto from 'crypto'

const sql = neon(process.env.DATABASE_URL!)
const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex')
}

function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return Response.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      )
    }

    const passwordHash = hashPassword(password)

    const [user] = await sql`
      SELECT id, email, full_name, role, status
      FROM users 
      WHERE email = ${email} AND password_hash = ${passwordHash}
    `

    if (!user) {
      return Response.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    if (user.status !== 'active') {
      return Response.json(
        { success: false, error: 'Account is not active' },
        { status: 403 }
      )
    }

    // Generate session token
    const sessionToken = generateSessionToken()
    
    // Store session in Redis (expires in 24 hours)
    await redis.set(`session:${sessionToken}`, {
      userId: user.id,
      email: user.email,
      role: user.role,
    }, { ex: 86400 })

    // Log the event
    await sql`
      INSERT INTO audit_log (user_id, event_type, resource_type, resource_id, metadata)
      VALUES (${user.id}, 'user.login', 'user', ${user.id}, ${JSON.stringify({ email })})
    `

    return Response.json({ 
      success: true, 
      data: {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.full_name,
          role: user.role,
        },
        token: sessionToken,
      }
    })
  } catch (error) {
    console.error('[v0] Error logging in:', error)
    return Response.json(
      { success: false, error: 'Failed to login' },
      { status: 500 }
    )
  }
}
