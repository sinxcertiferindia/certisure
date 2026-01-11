const { Plan, Organization, Certificate } = require("../models");

/**
 * Get all plans (Single Source of Truth)
 */
const getPlans = async (req, res) => {
    try {
        let plans = await Plan.find({}).sort({ monthlyPrice: 1 });

        // If no plans exist, initialize them with default pricing and features
        if (plans.length === 0) {
            plans = await Plan.insertMany([
                {
                    planName: 'FREE',
                    monthlyPrice: 0,
                    yearlyPrice: 0,
                    maxCertificatesPerMonth: 50,
                    maxTeamMembers: 1,
                    maxTemplates: 2,
                    features: ["50 Certificates/Month", "2 Default Templates", "Standard QR Verification", "Email Support"],
                    permissions: {
                        customTemplates: false,
                        bulkIssuance: false,
                        emailTemplates: false,
                        qrVerification: true,
                        analytics: false,
                        apiAccess: false,
                        customBackgrounds: false,
                        teams: false,
                        auditLogs: false,
                        whiteLabeling: false,
                        editorTools: {
                            textEditing: false, fontStyle: false, fontSize: false, fontColor: false,
                            shapes: false, backgroundImage: false, backgroundColor: false,
                            logoUpload: true, signatureUpload: true, sizeControl: false, orientationControl: false,
                        }
                    }
                },
                {
                    planName: 'PRO',
                    monthlyPrice: 29,
                    yearlyPrice: 290,
                    maxCertificatesPerMonth: 500,
                    maxTeamMembers: 5,
                    maxTemplates: 20,
                    features: ["500 Certificates/Month", "Unlimited Templates", "Bulk Issuance", "Priority Support", "Advanced Editor Tools"],
                    permissions: {
                        customTemplates: true,
                        bulkIssuance: true,
                        emailTemplates: true,
                        qrVerification: true,
                        analytics: true,
                        apiAccess: false,
                        customBackgrounds: true,
                        teams: true,
                        auditLogs: true,
                        whiteLabeling: false,
                        editorTools: {
                            textEditing: true, fontStyle: true, fontSize: true, fontColor: true,
                            shapes: true, backgroundImage: true, backgroundColor: true,
                            logoUpload: true, signatureUpload: true, sizeControl: true, orientationControl: true,
                        }
                    }
                },
                {
                    planName: 'ENTERPRISE',
                    monthlyPrice: 99,
                    yearlyPrice: 990,
                    maxCertificatesPerMonth: 5000,
                    maxTeamMembers: 20,
                    maxTemplates: 100,
                    features: ["5000 Certificates/Month", "White Labeling", "API Access", "Custom Domain", "Dedicated Support"],
                    permissions: {
                        customTemplates: true,
                        bulkIssuance: true,
                        emailTemplates: true,
                        qrVerification: true,
                        analytics: true,
                        apiAccess: true,
                        customBackgrounds: true,
                        teams: true,
                        auditLogs: true,
                        whiteLabeling: true,
                        editorTools: {
                            textEditing: true, fontStyle: true, fontSize: true, fontColor: true,
                            shapes: true, backgroundImage: true, backgroundColor: true,
                            logoUpload: true, signatureUpload: true, sizeControl: true, orientationControl: true,
                        }
                    }
                }
            ]);
        }

        res.json({
            success: true,
            data: plans
        });
    } catch (error) {
        console.error("Get plans error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Update plan details (SUPER_ADMIN only)
 */
const updatePlan = async (req, res) => {
    try {
        const { planName } = req.params;
        const updateData = req.body;

        const updatedPlan = await Plan.findOneAndUpdate(
            { planName },
            {
                ...updateData,
                lastUpdated: Date.now()
            },
            { new: true, upsert: true }
        );

        res.json({
            success: true,
            data: updatedPlan
        });
    } catch (error) {
        console.error("Update plan error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Get Plan Analytics (Dynamic Calculation from DB)
 */
const getPlanAnalytics = async (req, res) => {
    try {
        // 1. Fetch all plans to map IDs/Names
        const plans = await Plan.find({});

        // 2. Aggregate Organizations per plan
        const orgStats = await Organization.aggregate([
            {
                $group: {
                    _id: "$subscriptionPlan", // group by the string name for now as migration is pending
                    count: { $sum: 1 },
                    activeCount: {
                        $sum: { $cond: [{ $eq: ["$accountStatus", "ACTIVE"] }, 1, 0] }
                    }
                }
            }
        ]);

        // 3. Aggregate Certificates per plan
        const certStats = await Certificate.aggregate([
            {
                $lookup: {
                    from: "organizations",
                    localField: "orgId",
                    foreignField: "_id",
                    as: "organization"
                }
            },
            { $unwind: "$organization" },
            {
                $group: {
                    _id: "$organization.subscriptionPlan",
                    totalIssued: { $sum: 1 }
                }
            }
        ]);

        // 4. Calculate Revenue Estimates
        let totalRevenue = 0;
        const plansWithStats = plans.map(plan => {
            const stats = orgStats.find(s => s._id === plan.planName) || { count: 0, activeCount: 0 };
            const certs = certStats.find(c => c._id === plan.planName) || { totalIssued: 0 };

            const revenue = stats.activeCount * plan.monthlyPrice;
            totalRevenue += revenue;

            return {
                plan: plan.planName,
                monthlyPrice: plan.monthlyPrice,
                orgCount: stats.count,
                activeSubscriptions: stats.activeCount,
                expiredSubscriptions: stats.count - stats.activeCount,
                totalCertificatesIssued: certs.totalIssued,
                estimatedMonthlyRevenue: revenue
            };
        });

        res.json({
            success: true,
            data: {
                totalOrgs: await Organization.countDocuments({}),
                totalActiveOrgs: await Organization.countDocuments({ accountStatus: "ACTIVE" }),
                totalRevenueEstimate: totalRevenue,
                planBreakdown: plansWithStats
            }
        });
    } catch (error) {
        console.error("Get plan analytics error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getPlans,
    updatePlan,
    getPlanAnalytics
};
