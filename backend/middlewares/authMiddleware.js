const jwt = require('jsonwebtoken');

const authMiddleware = (roles = []) => {
    return (req, res, next) => {
        try {
            const token = req.headers.authorization?.split(' ')[1];
            if (!token) return res.status(401).json({ message: 'Authentication required' });

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded; // { userId, role }

            if (roles.length && !roles.includes(req.user.role)) {
                return res.status(403).json({ message: 'Forbidden. Not enough privileges.' });
            }

            next();
        } catch (error) {
            res.status(401).json({ message: 'Invalid or expired token' });
        }
    };
};

module.exports = authMiddleware;
