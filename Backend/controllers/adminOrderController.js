const db = require('../config/db');

const VALID_STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

// GET /api/admin/orders — every order, with customer info. Optional ?status=
async function getAllOrders(req, res) {
    try {
        const { status } = req.query;
        const where = status ? 'WHERE o.status = ?' : '';
        const params = status ? [status] : [];

        const [orders] = await db.query(
            `SELECT o.*, u.name AS customer_name, u.email AS customer_email
             FROM orders o
             JOIN users u ON o.user_id = u.id
             ${where}
             ORDER BY o.created_at DESC`,
            params
        );

        res.json({ orders });
    } catch (err) {
        console.error('Admin get orders error:', err);
        res.status(500).json({ message: 'Something went wrong loading orders.' });
    }
}

// PUT /api/admin/orders/:id/status  { status }
async function updateOrderStatus(req, res) {
    try {
        const { status } = req.body;
        if (!VALID_STATUSES.includes(status)) {
            return res.status(400).json({ message: `Status must be one of: ${VALID_STATUSES.join(', ')}.` });
        }

        const [result] = await db.query('UPDATE orders SET status = ? WHERE id = ?', [status, req.params.id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Order not found.' });
        }

        res.json({ message: 'Order status updated.' });
    } catch (err) {
        console.error('Admin update order status error:', err);
        res.status(500).json({ message: 'Something went wrong updating this order.' });
    }
}

module.exports = { getAllOrders, updateOrderStatus };
