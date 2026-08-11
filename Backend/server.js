require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// ---------- Core middleware ----------
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded product images statically (used from Phase 3 onward)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ---------- Health check ----------
// Visit http://localhost:5000/api/health to confirm the server + DB are alive
app.get('/api/health', async (req, res) => {
    res.json({ status: 'ok', message: 'E-Commerce Store API is running' });
});

// ---------- Routes ----------
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/cart', require('./routes/cartRoutes'));
app.use('/api/wishlist', require('./routes/wishlistRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/listings', require('./routes/listingRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
// Each remaining phase adds its routes here as they're built.
// app.use('/api/products', require('./routes/productRoutes'));
// app.use('/api/categories', require('./routes/categoryRoutes'));
// app.use('/api/cart', require('./routes/cartRoutes'));
// app.use('/api/wishlist', require('./routes/wishlistRoutes'));
// app.use('/api/orders', require('./routes/orderRoutes'));
// app.use('/api/admin', require('./routes/adminRoutes'));

// ---------- 404 handler ----------
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

// ---------- Global error handler ----------
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong on the server.' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
