const jwt = require('jsonwebtoken');

// Checks for a valid JWT in the Authorization header.
// Usage: Authorization: Bearer <token>
function verifyToken(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'No token provided. Please log in.' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // { id, role, name, email }
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Invalid or expired token. Please log in again.' });
    }
}

// Use AFTER verifyToken on routes only admins should access
function requireAdmin(req, res, next) {
    if (req.user?.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access only.' });
    }
    next();
}

module.exports = { verifyToken, requireAdmin };
