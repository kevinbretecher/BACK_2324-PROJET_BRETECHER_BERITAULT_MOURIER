const jwt = require('jsonwebtoken');
const secret = process.env.SECRET

function authenticateToken(req, res, next) {
    //middleware to check if user provided correct token, if yes puts the payload in req.decoded
    const authHeader = req.header('Authorization');
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    jwt.verify(token, secret, (err, decoded) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid token.' });
        }
        req.decoded = decoded;
        next();
    });
}

module.exports = authenticateToken;