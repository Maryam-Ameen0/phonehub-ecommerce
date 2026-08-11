const db = require('../config/db');

// GET /api/cart — the logged-in user's cart, joined with product info
async function getCart(req, res) {
    try {
        const [rows] = await db.query(
            `SELECT ci.id, ci.quantity, p.id AS product_id, p.name, p.brand, p.price,
                    p.image_url, p.stock, p.condition_status
             FROM cart_items ci
             JOIN products p ON ci.product_id = p.id
             WHERE ci.user_id = ?
             ORDER BY ci.created_at DESC`,
            [req.user.id]
        );

        const total = rows.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);

        res.json({ items: rows, total });
    } catch (err) {
        console.error('Get cart error:', err);
        res.status(500).json({ message: 'Something went wrong loading your cart.' });
    }
}

// POST /api/cart  { productId, quantity }
async function addToCart(req, res) {
    try {
        const { productId, quantity = 1 } = req.body;

        if (!productId) {
            return res.status(400).json({ message: 'productId is required.' });
        }

        const [productRows] = await db.query(
            'SELECT id, stock FROM products WHERE id = ? AND is_active = TRUE',
            [productId]
        );
        if (productRows.length === 0) {
            return res.status(404).json({ message: 'Product not found.' });
        }
        if (productRows[0].stock < quantity) {
            return res.status(400).json({ message: `Only ${productRows[0].stock} left in stock.` });
        }

        // If it's already in the cart, bump the quantity instead of duplicating the row
        await db.query(
            `INSERT INTO cart_items (user_id, product_id, quantity)
             VALUES (?, ?, ?)
             ON DUPLICATE KEY UPDATE quantity = quantity + ?`,
            [req.user.id, productId, quantity, quantity]
        );

        res.status(201).json({ message: 'Added to cart.' });
    } catch (err) {
        console.error('Add to cart error:', err);
        res.status(500).json({ message: 'Something went wrong adding this to your cart.' });
    }
}

// PUT /api/cart/:id  { quantity }  — :id is the cart_items row id
async function updateCartItem(req, res) {
    try {
        const { quantity } = req.body;

        if (!quantity || quantity < 1) {
            return res.status(400).json({ message: 'Quantity must be at least 1.' });
        }

        const [rows] = await db.query(
            `SELECT ci.id, p.stock FROM cart_items ci
             JOIN products p ON ci.product_id = p.id
             WHERE ci.id = ? AND ci.user_id = ?`,
            [req.params.id, req.user.id]
        );
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Cart item not found.' });
        }
        if (rows[0].stock < quantity) {
            return res.status(400).json({ message: `Only ${rows[0].stock} left in stock.` });
        }

        await db.query('UPDATE cart_items SET quantity = ? WHERE id = ?', [quantity, req.params.id]);
        res.json({ message: 'Cart updated.' });
    } catch (err) {
        console.error('Update cart error:', err);
        res.status(500).json({ message: 'Something went wrong updating your cart.' });
    }
}

// DELETE /api/cart/:id
async function removeFromCart(req, res) {
    try {
        const [result] = await db.query('DELETE FROM cart_items WHERE id = ? AND user_id = ?', [
            req.params.id,
            req.user.id
        ]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Cart item not found.' });
        }
        res.json({ message: 'Removed from cart.' });
    } catch (err) {
        console.error('Remove from cart error:', err);
        res.status(500).json({ message: 'Something went wrong removing this item.' });
    }
}

module.exports = { getCart, addToCart, updateCartItem, removeFromCart };
