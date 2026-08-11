const db = require('../config/db');

// GET /api/wishlist
async function getWishlist(req, res) {
    try {
        const [rows] = await db.query(
            `SELECT wi.id, p.id AS product_id, p.name, p.brand, p.price, p.image_url,
                    p.stock, p.condition_status
             FROM wishlist_items wi
             JOIN products p ON wi.product_id = p.id
             WHERE wi.user_id = ?
             ORDER BY wi.created_at DESC`,
            [req.user.id]
        );
        res.json({ items: rows });
    } catch (err) {
        console.error('Get wishlist error:', err);
        res.status(500).json({ message: 'Something went wrong loading your wishlist.' });
    }
}

// POST /api/wishlist  { productId }
async function addToWishlist(req, res) {
    try {
        const { productId } = req.body;
        if (!productId) {
            return res.status(400).json({ message: 'productId is required.' });
        }

        const [productRows] = await db.query(
            'SELECT id FROM products WHERE id = ? AND is_active = TRUE',
            [productId]
        );
        if (productRows.length === 0) {
            return res.status(404).json({ message: 'Product not found.' });
        }

        // Already-wishlisted is not an error — just treat it as a no-op success
        await db.query(
            'INSERT INTO wishlist_items (user_id, product_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE product_id = product_id',
            [req.user.id, productId]
        );

        res.status(201).json({ message: 'Added to wishlist.' });
    } catch (err) {
        console.error('Add to wishlist error:', err);
        res.status(500).json({ message: 'Something went wrong adding this to your wishlist.' });
    }
}

// DELETE /api/wishlist/:productId
async function removeFromWishlist(req, res) {
    try {
        const [result] = await db.query(
            'DELETE FROM wishlist_items WHERE product_id = ? AND user_id = ?',
            [req.params.productId, req.user.id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Wishlist item not found.' });
        }
        res.json({ message: 'Removed from wishlist.' });
    } catch (err) {
        console.error('Remove from wishlist error:', err);
        res.status(500).json({ message: 'Something went wrong removing this item.' });
    }
}

module.exports = { getWishlist, addToWishlist, removeFromWishlist };
