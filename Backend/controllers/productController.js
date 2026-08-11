const db = require('../config/db');

// GET /api/products
// Query params (all optional): search, category, brand, condition, minPrice, maxPrice, sort, page, limit
async function getProducts(req, res) {
    try {
        const {
            search,
            category,
            brand,
            condition,
            minPrice,
            maxPrice,
            sort,
            page = 1,
            limit = 12
        } = req.query;

        const where = ['p.is_active = TRUE', "p.approval_status = 'approved'"];
        const params = [];

        if (search) {
            where.push('(p.name LIKE ? OR p.brand LIKE ? OR p.description LIKE ?)');
            const term = `%${search}%`;
            params.push(term, term, term);
        }
        if (category) {
            where.push('c.slug = ?');
            params.push(category);
        }
        if (brand) {
            where.push('p.brand = ?');
            params.push(brand);
        }
        if (condition) {
            where.push('p.condition_status = ?');
            params.push(condition);
        }
        if (minPrice) {
            where.push('p.price >= ?');
            params.push(Number(minPrice));
        }
        if (maxPrice) {
            where.push('p.price <= ?');
            params.push(Number(maxPrice));
        }

        const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

        const sortMap = {
            price_asc: 'p.price ASC',
            price_desc: 'p.price DESC',
            newest: 'p.created_at DESC',
            name_asc: 'p.name ASC'
        };
        const orderClause = sortMap[sort] || sortMap.newest;

        const pageNum = Math.max(1, parseInt(page));
        const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
        const offset = (pageNum - 1) * limitNum;

        const [rows] = await db.query(
            `SELECT p.*, c.name AS category_name, c.slug AS category_slug,
                    u.name AS seller_name
             FROM products p
             LEFT JOIN categories c ON p.category_id = c.id
             LEFT JOIN users u ON p.seller_id = u.id
             ${whereClause}
             ORDER BY ${orderClause}
             LIMIT ? OFFSET ?`,
            [...params, limitNum, offset]
        );

        const [[{ total }]] = await db.query(
            `SELECT COUNT(*) AS total
             FROM products p
             LEFT JOIN categories c ON p.category_id = c.id
             ${whereClause}`,
            params
        );

        res.json({
            products: rows,
            pagination: {
                total,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(total / limitNum)
            }
        });
    } catch (err) {
        console.error('Get products error:', err);
        res.status(500).json({ message: 'Something went wrong loading products.' });
    }
}

// GET /api/products/:id
async function getProductById(req, res) {
    try {
        const [rows] = await db.query(
            `SELECT p.*, c.name AS category_name, c.slug AS category_slug,
                    u.name AS seller_name
             FROM products p
             LEFT JOIN categories c ON p.category_id = c.id
             LEFT JOIN users u ON p.seller_id = u.id
             WHERE p.id = ? AND p.is_active = TRUE AND p.approval_status = 'approved'`,
            [req.params.id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Product not found.' });
        }

        res.json({ product: rows[0] });
    } catch (err) {
        console.error('Get product error:', err);
        res.status(500).json({ message: 'Something went wrong loading this product.' });
    }
}

// GET /api/products/meta/brands — distinct brands, used to build the filter sidebar
async function getBrands(req, res) {
    try {
        const [rows] = await db.query(
            `SELECT DISTINCT TRIM(brand) AS brand FROM products
             WHERE brand IS NOT NULL AND TRIM(brand) != '' AND is_active = TRUE
             ORDER BY brand ASC`
        );
        res.json({ brands: rows.map((r) => r.brand) });
    } catch (err) {
        console.error('Get brands error:', err);
        res.status(500).json({ message: 'Something went wrong loading brands.' });
    }
}

module.exports = { getProducts, getProductById, getBrands };
