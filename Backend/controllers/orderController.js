const db = require('../config/db');

// POST /api/orders  { shippingAddress, shippingPhone }
// Builds the order from whatever is currently in the user's cart.
async function placeOrder(req, res) {
    const { shippingAddress, shippingPhone } = req.body;

    if (!shippingAddress || !shippingPhone) {
        return res.status(400).json({ message: 'Shipping address and phone are required.' });
    }

    // Use a transaction: order + order_items + stock decrement + cart clear
    // must all succeed together, or none of them should happen.
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        const [cartRows] = await connection.query(
            `SELECT ci.id AS cart_item_id, ci.quantity, p.id AS product_id, p.name, p.price, p.stock
             FROM cart_items ci
             JOIN products p ON ci.product_id = p.id
             WHERE ci.user_id = ?`,
            [req.user.id]
        );

        if (cartRows.length === 0) {
            await connection.rollback();
            return res.status(400).json({ message: 'Your cart is empty.' });
        }

        // Re-check stock at checkout time — it may have changed since items were added
        for (const item of cartRows) {
            if (item.quantity > item.stock) {
                await connection.rollback();
                return res.status(400).json({
                    message: `"${item.name}" only has ${item.stock} left in stock. Please update your cart.`
                });
            }
        }

        const total = cartRows.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);

        const [orderResult] = await connection.query(
            `INSERT INTO orders (user_id, total_amount, status, shipping_address, shipping_phone, payment_method)
             VALUES (?, ?, 'pending', ?, ?, 'Cash on Delivery')`,
            [req.user.id, total, shippingAddress, shippingPhone]
        );
        const orderId = orderResult.insertId;

        for (const item of cartRows) {
            await connection.query(
                `INSERT INTO order_items (order_id, product_id, product_name, price, quantity)
                 VALUES (?, ?, ?, ?, ?)`,
                [orderId, item.product_id, item.name, item.price, item.quantity]
            );
            await connection.query('UPDATE products SET stock = stock - ? WHERE id = ?', [
                item.quantity,
                item.product_id
            ]);
        }

        await connection.query('DELETE FROM cart_items WHERE user_id = ?', [req.user.id]);

        await connection.commit();

        res.status(201).json({ message: 'Order placed successfully.', orderId, total });
    } catch (err) {
        await connection.rollback();
        console.error('Place order error:', err);
        res.status(500).json({ message: 'Something went wrong placing your order.' });
    } finally {
        connection.release();
    }
}

// GET /api/orders — the logged-in user's order history
async function getOrders(req, res) {
    try {
        const [orders] = await db.query(
            `SELECT id, total_amount, status, payment_method, created_at
             FROM orders WHERE user_id = ? ORDER BY created_at DESC`,
            [req.user.id]
        );
        res.json({ orders });
    } catch (err) {
        console.error('Get orders error:', err);
        res.status(500).json({ message: 'Something went wrong loading your orders.' });
    }
}

// GET /api/orders/:id — one order with its items (must belong to the requesting user, unless admin)
async function getOrderById(req, res) {
    try {
        const isAdmin = req.user.role === 'admin';
        const orderQuery = isAdmin
            ? 'SELECT * FROM orders WHERE id = ?'
            : 'SELECT * FROM orders WHERE id = ? AND user_id = ?';
        const orderParams = isAdmin ? [req.params.id] : [req.params.id, req.user.id];

        const [orders] = await db.query(orderQuery, orderParams);
        if (orders.length === 0) {
            return res.status(404).json({ message: 'Order not found.' });
        }

        const [items] = await db.query('SELECT * FROM order_items WHERE order_id = ?', [req.params.id]);

        res.json({ order: orders[0], items });
    } catch (err) {
        console.error('Get order error:', err);
        res.status(500).json({ message: 'Something went wrong loading this order.' });
    }
}

module.exports = { placeOrder, getOrders, getOrderById };
