const mongoose = require('mongoose');

const verificationSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    otp: {
        type: String,
    },
    expires: {
        type: Date,
    },
    verified: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
});

verificationSchema.index({ expires: 1 }, { expireAfterSeconds: 0 }); // Auto-delete expired documents? No, we might need to know it expired. 
// Actually, if we use separate expires field for logic, we can use a TTL index on createdAt or a separate one.
// Let's rely on logic for now. But we should clean up old ones.
// Let's add a TTL based on updatedAt to clean up eventually (e.g. 1 hour).
verificationSchema.index({ updatedAt: 1 }, { expireAfterSeconds: 3600 });

module.exports = mongoose.model('Verification', verificationSchema);
