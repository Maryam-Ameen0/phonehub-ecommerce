const fs = require('fs');
const path = require('path');
const db = require('../config/db');

// POST /api/listings  (multipart/form-data, field "image" for the photo)
async function createListing(req, res) {
    try {
        const { name, brand, storage, ram, color, conditionStatus, description, price, stock, categoryId } =
            req.body;

        if (!name || !price || !categoryId) {
            return res.status(400).json({ message: 'Name, price, and category are required.' });
        }
        if (Number(price) <= 0) {
            return res.status(400).json({ message: 'Price must be greater than 0.' });
        }

        const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

        const [result] = await db.query(
            `INSERT INTO products
                (name, brand, storage, ram, color, condition_status, description, price, stock,
                 category_id, seller_id, approval_status, image_url)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)`,
            [
                name,
                brand || null,
                storage || null,
                ram || null,
                color || null,
                conditionStatus || 'Used',
                description || null,
                price,
                stock || 1,
                categoryId,
                req.user.id,
                imageUrl
            ]
        );

        res.status(201).json({
            message: 'Your listing has been submitted and is awaiting admin approval.',
            productId: result.insertId
        });
    } catch (err) {
        console.error('Create listing error:', err);
        res.status(500).json({ message: 'Something went wrong submitting your listing.' });
    }
}

// GET /api/listings/mine — the logged-in user's own listings, any status
async function getMyListings(req, res) {
    try {
        const [rows] = await db.query(
            `SELECT p.*, c.name AS category_name
             FROM products p
             LEFT JOIN categories c ON p.category_id = c.id
             WHERE p.seller_id = ?
             ORDER BY p.created_at DESC`,
            [req.user.id]
        );
        res.json({ listings: rows });
    } catch (err) {
        console.error('Get my listings error:', err);
        res.status(500).json({ message: 'Something went wrong loading your listings.' });
    }
}

// DELETE /api/listings/:id — seller can remove their own listing
async function deleteListing(req, res) {
    try {
        const [rows] = await db.query('SELECT image_url FROM products WHERE id = ? AND seller_id = ?', [
            req.params.id,
            req.user.id
        ]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Listing not found.' });
        }

        await db.query('DELETE FROM products WHERE id = ? AND seller_id = ?', [req.params.id, req.user.id]);

        // Best-effort cleanup of the uploaded image file — not critical if it fails
        if (rows[0].image_url) {
            const filePath = path.join(__dirname, '..', rows[0].image_url);
            fs.unlink(filePath, () => {});
        }

        res.json({ message: 'Listing removed.' });
    } catch (err) {
        console.error('Delete listing error:', err);
        res.status(500).json({ message: 'Something went wrong removing this listing.' });
    }
}

module.exports = { createListing, getMyListings, deleteListing };
