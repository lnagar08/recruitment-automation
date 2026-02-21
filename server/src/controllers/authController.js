const jwt = require('jsonwebtoken');
const { generateTokens } = require('../utils/tokenHelper');

exports.refreshToken = (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) return res.status(401).json({ message: "Refresh Token Required" });

    try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        
        const payload = { agency_id: decoded.agency_id, user_id: decoded.user_id };
        const tokens = generateTokens(payload);

        res.json({ success: true, ...tokens });
    } catch (err) {
        return res.status(403).json({ message: "Invalid or Expired Refresh Token" });
    }
};
