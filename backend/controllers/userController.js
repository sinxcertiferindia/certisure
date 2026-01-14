const { User } = require("../models");

/**
 * Get current logged-in user details
 * @route GET /api/users/me
 */
const getCurrentUser = async (req, res) => {
    try {
        const userId = req.user.userId;

        const user = await User.findById(userId)
            .select("-password")
            .populate({
                path: "orgId",
                select: "name email subscriptionPlan subscriptionStatus accountStatus logo planId certificatePrefixes defaultCertificatePrefix",
                populate: {
                    path: "planId",
                    select: "planName monthlyPrice permissions features"
                }
            });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.json({
            success: true,
            data: {
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    mobile: user.mobile,
                    role: user.role,
                    isActive: user.isActive,
                    lastLogin: user.lastLogin
                },
                organization: user.orgId ? {
                    _id: user.orgId._id,
                    name: user.orgId.name,
                    email: user.orgId.email,
                    subscriptionPlan: user.orgId.subscriptionPlan,
                    subscriptionStatus: user.orgId.subscriptionStatus,
                    accountStatus: user.orgId.accountStatus,
                    logo: user.orgId.logo,
                    certificatePrefixes: user.orgId.certificatePrefixes,
                    defaultCertificatePrefix: user.orgId.defaultCertificatePrefix,
                    plan: user.orgId.planId
                } : null
            }
        });
    } catch (error) {
        console.error("Get current user error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch user details"
        });
    }
};

/**
 * Get all users (Master Dashboard / Org Admin)
 * @route GET /api/users
 */
const getAllUsers = async (req, res) => {
    try {
        const query = {};
        // If not super admin, filter by own org
        if (req.user.role !== "SUPER_ADMIN" && req.user.role !== "admin") {
            query.orgId = req.user.orgId;
        }

        const users = await User.find(query)
            .select("-password")
            .populate("orgId", "name email subscriptionPlan")
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            data: users
        });
    } catch (error) {
        console.error("Get all users error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch users"
        });
    }
};

/**
 * Create a new Super Admin (Master Admin)
 * @route POST /api/users/super-admin
 */
const createSuperAdmin = async (req, res) => {
    try {
        const { name, email, password, mobile } = req.body;
        const orgId = req.user.orgId; // Inherit organization from creator

        // Check if email exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User with this email already exists"
            });
        }

        const user = await User.create({
            name,
            email,
            password,
            mobile,
            orgId,
            role: "SUPER_ADMIN",
            isActive: true
        });

        res.status(201).json({
            success: true,
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error("Create super admin error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to create super admin"
        });
    }
};

module.exports = {
    getCurrentUser,
    getAllUsers,
    createSuperAdmin
};
