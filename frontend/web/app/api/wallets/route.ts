import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    const wallets = await sql`
      SELECT * FROM wallets 
      WHERE status = 'active'
      ORDER BY created_at DESC
      LIMIT 50
    `
    
    return Response.json({ 
      success: true, 
      data: wallets 
    })
  } catch (error) {
    console.error('[v0] Error fetching wallets:', error)
    return Response.json(
      { success: false, error: 'Failed to fetch wallets' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { 
      owner_id, 
      owner_type = 'user',
      address, 
      wallet_type = 'ETH'
    } = body

    if (!owner_id || !address) {
      return Response.json(
        { success: false, error: 'Owner ID and address are required' },
        { status: 400 }
      )
    }

    const [wallet] = await sql`
      INSERT INTO wallets (owner_id, owner_type, address, wallet_type, status)
      VALUES (${owner_id}, ${owner_type}, ${address}, ${wallet_type}, 'active')
      RETURNING *
    `

    // Log the event
    await sql`
      INSERT INTO audit_log (user_id, event_type, resource_type, resource_id, metadata)
      VALUES (${owner_id}, 'wallet.created', 'wallet', ${wallet.id}, ${JSON.stringify({ address, wallet_type })})
    `

    return Response.json({ 
      success: true, 
      data: wallet 
    })
  } catch (error) {
    console.error('[v0] Error creating wallet:', error)
    return Response.json(
      { success: false, error: 'Failed to create wallet' },
      { status: 500 }
    )
  }
}
