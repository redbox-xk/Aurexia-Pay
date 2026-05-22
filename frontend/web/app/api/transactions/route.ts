import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    const transactions = await sql`
      SELECT 
        t.*,
        m.business_name as merchant_name,
        u.email as customer_email
      FROM transactions t
      LEFT JOIN merchants m ON t.merchant_id = m.id
      LEFT JOIN users u ON t.customer_id = u.id
      ORDER BY t.created_at DESC
      LIMIT 50
    `
    
    return Response.json({ 
      success: true, 
      data: transactions 
    })
  } catch (error) {
    console.error('[v0] Error fetching transactions:', error)
    return Response.json(
      { success: false, error: 'Failed to fetch transactions' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { 
      merchant_id, 
      customer_id, 
      wallet_id,
      amount, 
      currency = 'USD',
      crypto_amount,
      crypto_currency,
      payment_method,
      metadata 
    } = body

    const [transaction] = await sql`
      INSERT INTO transactions (
        merchant_id, 
        customer_id, 
        wallet_id,
        amount, 
        currency,
        crypto_amount,
        crypto_currency,
        payment_method,
        metadata,
        status
      )
      VALUES (
        ${merchant_id || null}, 
        ${customer_id || null}, 
        ${wallet_id || null},
        ${amount}, 
        ${currency},
        ${crypto_amount || null},
        ${crypto_currency || null},
        ${payment_method || 'crypto'},
        ${JSON.stringify(metadata || {})},
        'pending'
      )
      RETURNING *
    `

    // Log the event
    await sql`
      INSERT INTO audit_log (event_type, resource_type, resource_id, metadata)
      VALUES ('transaction.created', 'transaction', ${transaction.id}, ${JSON.stringify({ amount, currency })})
    `

    return Response.json({ 
      success: true, 
      data: transaction 
    })
  } catch (error) {
    console.error('[v0] Error creating transaction:', error)
    return Response.json(
      { success: false, error: 'Failed to create transaction' },
      { status: 500 }
    )
  }
}
