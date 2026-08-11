const express = require('express');
const router = express.Router();
const { verifyToken, requireAdmin } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

const {
    getAllProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    approveProduct,
    rejectProduct
} = require('../controllers/adminProductController');
const { getAllOrders, updateOrderStatus } = require('../controllers/adminOrderController');
const { getAllUsers, deleteUser } = require('../controllers/adminUserController');
const { getAnalytics } = require('../controllers/adminAnalyticsController');

router.use(verifyToken, requireAdmin); // everything below requires an admin login

router.get('/analytics', getAnalytics);

router.get('/products', getAllProducts);
router.post('/products', upload.single('image'), createProduct);
router.put('/products/:id', upload.single('image'), updateProduct);
router.delete('/products/:id', deleteProduct);
router.put('/products/:id/approve', approveProduct);
router.put('/products/:id/reject', rejectProduct);

router.get('/orders', getAllOrders);
router.put('/orders/:id/status', updateOrderStatus);

router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);

module.exports = router;
