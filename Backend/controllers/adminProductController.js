const fs = require('fs');
const path = require('path');
const db = require('../config/db');

// GET /api/admin/products — every product, any status. Optional ?status=pending|approved|rejected&search=
async function getAllProducts(req, res) {
    try {
        const { status, search, page = 1, limit = 20 } = req.query;

        const where = [];
        const params = [];

        if (status) {
            where.push('p.approval_status = ?');
            params.push(status);
        }
        if (search) {
            where.push('(p.name LIKE ? OR p.brand LIKE ?)');
            params.push(`%${search}%`, `%${search}%`);
        }
        const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

        const pageNum = Math.max(1, parseInt(page));
        const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
        const offset = (pageNum - 1) * limitNum;

        const [rows] = await db.query(
            `SELECT p.*, c.name AS category_name, u.name AS seller_name, u.email AS seller_email
             FROM products p
             LEFT JOIN categories c ON p.category_id = c.id
             LEFT JOIN users u ON p.seller_id = u.id
             ${whereClause}
             ORDER BY p.created_at DESC
             LIMIT ? OFFSET ?`,
            [...params, limitNum, offset]
        );

        const [[{ total }]] = await db.query(
            `SELECT COUNT(*) AS total FROM products p ${whereClause}`,
            params
        );

        res.json({ products: rows, pagination: { total, page: pageNum, limit: limitNum } });
    } catch (err) {
        console.error('Admin get products error:', err);
        res.status(500).json({ message: 'Something went wrong loading products.' });
    }
}

// POST /api/admin/products — admin adds a product directly (auto-approved, no seller)
async function createProduct(req, res) {
    try {
        const { name, brand, storage, ram, color, conditionStatus, description, price, stock, categoryId } =
            req.body;

        if (!name || !price || !categoryId) {
            return res.status(400).json({ message: 'Name, price, and category are required.' });
        }

        const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

        const [result] = await db.query(
            `INSERT INTO products
                (name, brand, storage, ram, color, condition_status, description, price, stock,
                 category_id, seller_id, approval_status, image_url)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, 'approved', ?)`,
            [
                name,
                brand || null,
                storage || null,
                ram || null,
                color || null,
                conditionStatus || 'New',
                description || null,
                price,
                stock || 0,
                categoryId,
                imageUrl
            ]
        );

        res.status(201).json({ message: 'Product added.', productId: result.insertId });
    } catch (err) {
        console.error('Admin create product error:', err);
        res.status(500).json({ message: 'Something went wrong adding this product.' });
    }
}

// PUT /api/admin/products/:id — edit any field on any product; replaces image if a new one is uploaded
async function updateProduct(req, res) {
    try {
        const [existingRows] = await db.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
        if (existingRows.length === 0) {
            return res.status(404).json({ message: 'Product not found.' });
        }
        const existing = existingRows[0];

        const {
            name,
            brand,
            storage,
            ram,
            color,
            conditionStatus,
            description,
            price,
            stock,
            categoryId,
            isActive
        } = req.body;

        let imageUrl = existing.image_url;
        if (req.file) {
            imageUrl = `/uploads/${req.file.filename}`;
            if (existing.image_url) {
                fs.unlink(path.join(__dirname, '..', existing.image_url), () => {});
            }
        }

        await db.query(
            `UPDATE products SET
                name = ?, brand = ?, storage = ?, ram = ?, color = ?, condition_status = ?,
                description = ?, price = ?, stock = ?, category_id = ?, image_url = ?,
                is_active = ?
             WHERE id = ?`,
            [
                name ?? existing.name,
                brand ?? existing.brand,
                storage ?? existing.storage,
                ram ?? existing.ram,
                color ?? existing.color,
                conditionStatus ?? existing.condition_status,
                description ?? existing.description,
                price ?? existing.price,
                stock ?? existing.stock,
                categoryId ?? existing.category_id,
                imageUrl,
                isActive !== undefined ? isActive === 'true' || isActive === true : existing.is_active,
                req.params.id
            ]
        );

        res.json({ message: 'Product updated.' });
    } catch (err) {
        console.error('Admin update product error:', err);
        res.status(500).json({ message: 'Something went wrong updating this product.' });
    }
}

// DELETE /api/admin/products/:id
async function deleteProduct(req, res) {
    try {
        const [rows] = await db.query('SELECT image_url FROM products WHERE id = ?', [req.params.id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Product not found.' });
        }

        await db.query('DELETE FROM products WHERE id = ?', [req.params.id]);

        if (rows[0].image_url) {
            fs.unlink(path.join(__dirname, '..', rows[0].image_url), () => {});
        }

        res.json({ message: 'Product deleted.' });
    } catch (err) {
        console.error('Admin delete product error:', err);
        // Most likely cause: this product is referenced by existing order_items (FK is ON DELETE SET NULL there,
        // so this shouldn't actually block deletion — but surface a clear message just in case).
        res.status(500).json({ message: 'Something went wrong deleting this product.' });
    }
}

// PUT /api/admin/products/:id/approve
async function approveProduct(req, res) {
    try {
        const [result] = await db.query(
            "UPDATE products SET approval_status = 'approved', rejection_reason = NULL WHERE id = ?",
            [req.params.id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Product not found.' });
        }
        res.json({ message: 'Listing approved.' });
    } catch (err) {
        console.error('Approve product error:', err);
        res.status(500).json({ message: 'Something went wrong approving this listing.' });
    }
}

// PUT /api/admin/products/:id/reject  { reason }
async function rejectProduct(req, res) {
    try {
        const { reason } = req.body;
        const [result] = await db.query(
            "UPDATE products SET approval_status = 'rejected', rejection_reason = ? WHERE id = ?",
            [reason || 'Does not meet listing guidelines.', req.params.id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Product not found.' });
        }
        res.json({ message: 'Listing rejected.' });
    } catch (err) {
        console.error('Reject product error:', err);
        res.status(500).json({ message: 'Something went wrong rejecting this listing.' });
    }
}

module.exports = {
    getAllProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    approveProduct,
    rejectProduct
};
