const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');
const { createListing, getMyListings, deleteListing } = require('../controllers/listingController');

router.use(verifyToken); // every listing route requires login

router.post('/', upload.single('image'), createListing);
router.get('/mine', getMyListings);
router.delete('/:id', deleteListing);

module.exports = router;
