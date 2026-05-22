import { neon } from '@neondatabase/serverless'
import { Redis } from '@upstash/redis'

const sql = neon(process.env.DATABASE_URL!)
const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

export async function GET() {
  try {
    // Try to get from cache first
    const cached = await redis.get('dashboard:stats')
    if (cached) {
      return Response.json({ 
        success: true, 
        data: cached,
        cached: true
      })
    }

    // Get stats from database
    const [transactionStats] = await sql`
      SELECT 
        COUNT(*) as total_transactions,
        COALESCE(SUM(amount), 0) as total_volume,
        COALESCE(AVG(amount), 0) as avg_transaction,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_count,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count,
        COUNT(CASE WHEN created_at > NOW() - INTERVAL '24 hours' THEN 1 END) as today_count,
        COALESCE(SUM(CASE WHEN created_at > NOW() - INTERVAL '24 hours' THEN amount ELSE 0 END), 0) as today_volume
      FROM transactions
    `

    const [userStats] = await sql`
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN created_at > NOW() - INTERVAL '7 days' THEN 1 END) as new_users_week
      FROM users
    `

    const [merchantStats] = await sql`
      SELECT 
        COUNT(*) as total_merchants,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_merchants
      FROM merchants
    `

    const recentTransactions = await sql`
      SELECT id, amount, currency, status, created_at, payment_method
      FROM transactions
      ORDER BY created_at DESC
      LIMIT 5
    `

    const stats = {
      transactions: {
        total: Number(transactionStats.total_transactions),
        volume: Number(transactionStats.total_volume),
        average: Number(transactionStats.avg_transaction),
        completed: Number(transactionStats.completed_count),
        pending: Number(transactionStats.pending_count),
        todayCount: Number(transactionStats.today_count),
        todayVolume: Number(transactionStats.today_volume),
      },
      users: {
        total: Number(userStats.total_users),
        newThisWeek: Number(userStats.new_users_week),
      },
      merchants: {
        total: Number(merchantStats.total_merchants),
        active: Number(merchantStats.active_merchants),
      },
      recentTransactions,
    }

    // Cache for 60 seconds
    await redis.set('dashboard:stats', stats, { ex: 60 })

    return Response.json({ 
      success: true, 
      data: stats 
    })
  } catch (error) {
    console.error('[v0] Error fetching dashboard stats:', error)
    return Response.json(
      { success: false, error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}
