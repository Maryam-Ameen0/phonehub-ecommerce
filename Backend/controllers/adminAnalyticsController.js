const db = require('../config/db');

// GET /api/admin/analytics
async function getAnalytics(req, res) {
    try {
        const [[summary]] = await db.query(`
            SELECT
                (SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE status != 'cancelled') AS total_revenue,
                (SELECT COUNT(*) FROM orders) AS total_orders,
                (SELECT COUNT(*) FROM users WHERE role = 'customer') AS total_customers,
                (SELECT COUNT(*) FROM products WHERE approval_status = 'approved') AS total_products,
                (SELECT COUNT(*) FROM products WHERE approval_status = 'pending') AS pending_listings
        `);

        // Revenue for each of the last 14 days (fills in zero for days with no orders)
        const [revenueRows] = await db.query(`
            SELECT DATE(created_at) AS day, SUM(total_amount) AS revenue
            FROM orders
            WHERE status != 'cancelled' AND created_at >= DATE_SUB(CURDATE(), INTERVAL 13 DAY)
            GROUP BY DATE(created_at)
            ORDER BY day ASC
        `);
        const revenueMap = Object.fromEntries(revenueRows.map((r) => [r.day.toISOString().slice(0, 10), Number(r.revenue)]));
        const revenueByDay = [];
        for (let i = 13; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const key = d.toISOString().slice(0, 10);
            revenueByDay.push({ date: key, revenue: revenueMap[key] || 0 });
        }

        // Order status breakdown
        const [statusRows] = await db.query(
            `SELECT status, COUNT(*) AS count FROM orders GROUP BY status`
        );

        // Top 5 best-selling products by quantity
        const [topProducts] = await db.query(`
            SELECT oi.product_name, SUM(oi.quantity) AS units_sold, SUM(oi.price * oi.quantity) AS revenue
            FROM order_items oi
            JOIN orders o ON oi.order_id = o.id
            WHERE o.status != 'cancelled'
            GROUP BY oi.product_name
            ORDER BY units_sold DESC
            LIMIT 5
        `);

        res.json({
            summary: {
                totalRevenue: Number(summary.total_revenue),
                totalOrders: summary.total_orders,
                totalCustomers: summary.total_customers,
                totalProducts: summary.total_products,
                pendingListings: summary.pending_listings
            },
            revenueByDay,
            ordersByStatus: statusRows,
            topProducts
        });
    } catch (err) {
        console.error('Admin analytics error:', err);
        res.status(500).json({ message: 'Something went wrong loading analytics.' });
    }
}

module.exports = { getAnalytics };
