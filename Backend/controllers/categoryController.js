const db = require('../config/db');

// GET /api/categories
async function getCategories(req, res) {
    try {
        const [rows] = await db.query('SELECT * FROM categories ORDER BY name ASC');
        res.json({ categories: rows });
    } catch (err) {
        console.error('Get categories error:', err);
        res.status(500).json({ message: 'Something went wrong loading categories.' });
    }
}

module.exports = { getCategories };
