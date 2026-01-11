const mongoose = require('mongoose');

const planSchema = new mongoose.Schema({
    planName: {
        type: String,
        required: true,
        enum: ['FREE', 'PRO', 'ENTERPRISE'],
        unique: true
    },
    monthlyPrice: {
        type: Number,
        required: true,
        default: 0
    },
    yearlyPrice: {
        type: Number,
        default: 0
    },
    maxCertificatesPerMonth: {
        type: Number,
        required: true,
        default: 50
    },
    maxTeamMembers: {
        type: Number,
        required: true,
        default: 1
    },
    maxTemplates: {
        type: Number,
        default: 2
    },
    features: {
        type: [String],
        default: []
    },
    // Detailed feature flags for logic (merging PlanPermission functionality)
    permissions: {
        customTemplates: { type: Boolean, default: false },
        bulkIssuance: { type: Boolean, default: false },
        emailTemplates: { type: Boolean, default: false },
        qrVerification: { type: Boolean, default: true },
        analytics: { type: Boolean, default: false },
        apiAccess: { type: Boolean, default: false },
        customBackgrounds: { type: Boolean, default: false },
        teams: { type: Boolean, default: false },
        auditLogs: { type: Boolean, default: false },
        whiteLabeling: { type: Boolean, default: false },
        editorTools: {
            textEditing: { type: Boolean, default: false },
            fontStyle: { type: Boolean, default: false },
            fontSize: { type: Boolean, default: false },
            fontColor: { type: Boolean, default: false },
            shapes: { type: Boolean, default: false },
            backgroundImage: { type: Boolean, default: false },
            backgroundColor: { type: Boolean, default: false },
            logoUpload: { type: Boolean, default: true },
            signatureUpload: { type: Boolean, default: true },
            sizeControl: { type: Boolean, default: false },
            orientationControl: { type: Boolean, default: false },
        }
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

module.exports = mongoose.model('Plan', planSchema);
