import { neon } from '@neondatabase/serverless'
import crypto from 'crypto'

const sql = neon(process.env.DATABASE_URL!)

function generateApiKey(): string {
  return `nxa_${crypto.randomBytes(24).toString('hex')}`
}

export async function GET() {
  try {
    const merchants = await sql`
      SELECT 
        m.*,
        u.email as user_email,
        u.full_name as user_name
      FROM merchants m
      LEFT JOIN users u ON m.user_id = u.id
      ORDER BY m.created_at DESC
      LIMIT 50
    `
    
    return Response.json({ 
      success: true, 
      data: merchants 
    })
  } catch (error) {
    console.error('[v0] Error fetching merchants:', error)
    return Response.json(
      { success: false, error: 'Failed to fetch merchants' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { 
      user_id, 
      business_name, 
      business_email,
      webhook_url
    } = body

    if (!user_id || !business_name) {
      return Response.json(
        { success: false, error: 'User ID and business name are required' },
        { status: 400 }
      )
    }

    const apiKey = generateApiKey()

    const [merchant] = await sql`
      INSERT INTO merchants (user_id, business_name, business_email, webhook_url, api_key, status)
      VALUES (${user_id}, ${business_name}, ${business_email || null}, ${webhook_url || null}, ${apiKey}, 'active')
      RETURNING *
    `

    // Log the event
    await sql`
      INSERT INTO audit_log (user_id, event_type, resource_type, resource_id, metadata)
      VALUES (${user_id}, 'merchant.created', 'merchant', ${merchant.id}, ${JSON.stringify({ business_name })})
    `

    return Response.json({ 
      success: true, 
      data: merchant 
    })
  } catch (error) {
    console.error('[v0] Error creating merchant:', error)
    return Response.json(
      { success: false, error: 'Failed to create merchant' },
      { status: 500 }
    )
  }
}
