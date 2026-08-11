const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const { placeOrder, getOrders, getOrderById } = require('../controllers/orderController');

router.use(verifyToken); // every order route requires login

router.post('/', placeOrder);
router.get('/', getOrders);
router.get('/:id', getOrderById);

module.exports = router;
