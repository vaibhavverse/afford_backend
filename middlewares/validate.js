module.exports = (req, res, next) => {
    // Validate payloads for methods that expect a body
    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
        if (!req.body || typeof req.body !== "object" || Object.keys(req.body).length === 0) {
            return res.status(400).json({ error: "Invalid payload" });
        }
    }
    
    // Validate GET query parameters for specific routes
    if (req.method === 'GET') {
        if (req.query.limit !== undefined) {
            const limit = parseInt(req.query.limit, 10);
            if (isNaN(limit) || limit <= 0) {
                return res.status(400).json({ error: "Invalid limit parameter. Must be a positive integer." });
            }
        }
    }

    next();
};