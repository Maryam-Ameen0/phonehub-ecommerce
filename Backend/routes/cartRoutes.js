const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const { getCart, addToCart, updateCartItem, removeFromCart } = require('../controllers/cartController');

router.use(verifyToken); // every cart route requires login

router.get('/', getCart);
router.post('/', addToCart);
router.put('/:id', updateCartItem);
router.delete('/:id', removeFromCart);

module.exports = router;
