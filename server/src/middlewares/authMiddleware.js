const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ message: "Access Token Missing" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
        req.agency_id = decoded.agency_id;
        next();
    } catch (err) {
        
        return res.status(403).json({ message: "Access Token Expired" });
    }
};

module.exports = authMiddleware;
