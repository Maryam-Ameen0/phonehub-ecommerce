const db = require('../config/db');

// GET /api/admin/users
async function getAllUsers(req, res) {
    try {
        const [rows] = await db.query(
            `SELECT u.id, u.name, u.email, u.role, u.phone, u.created_at,
                    (SELECT COUNT(*) FROM orders o WHERE o.user_id = u.id) AS order_count,
                    (SELECT COUNT(*) FROM products p WHERE p.seller_id = u.id) AS listing_count
             FROM users u
             ORDER BY u.created_at DESC`
        );
        res.json({ users: rows });
    } catch (err) {
        console.error('Admin get users error:', err);
        res.status(500).json({ message: 'Something went wrong loading users.' });
    }
}

// DELETE /api/admin/users/:id — blocked for admin accounts and for deleting yourself
async function deleteUser(req, res) {
    try {
        if (Number(req.params.id) === req.user.id) {
            return res.status(400).json({ message: 'You cannot delete your own account.' });
        }

        const [rows] = await db.query('SELECT role FROM users WHERE id = ?', [req.params.id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'User not found.' });
        }
        if (rows[0].role === 'admin') {
            return res.status(400).json({ message: 'Admin accounts cannot be deleted from here.' });
        }

        // Cascades to their orders/cart/wishlist/listings by design (see schema foreign keys)
        await db.query('DELETE FROM users WHERE id = ?', [req.params.id]);
        res.json({ message: 'User deleted.' });
    } catch (err) {
        console.error('Admin delete user error:', err);
        res.status(500).json({ message: 'Something went wrong deleting this user.' });
    }
}

module.exports = { getAllUsers, deleteUser };
