const express = require('express');
const router = express.Router();
const { getProducts, getProductById, getBrands } = require('../controllers/productController');

router.get('/meta/brands', getBrands); // must come before /:id so "meta" isn't read as an id
router.get('/', getProducts);
router.get('/:id', getProductById);

module.exports = router;
