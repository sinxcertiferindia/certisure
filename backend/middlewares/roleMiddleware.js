/**
 * Middleware to restrict access to specific roles
 * @param {string[]} roles - Array of allowed roles
 */
const authorize = (roles = []) => {
    if (typeof roles === "string") {
        roles = [roles];
    }

    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: "Forbidden: You do not have permission to perform this action"
            });
        }
        next();
    };
};

module.exports = authorize;
