const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const { Organization, Plan } = require('./models');

const checkAndFix = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        // 1. Fix Plan Defaults
        console.log('Fixing Plan Definitions...');

        // Define correct limits
        const plansToFix = [
            { name: 'FREE', limit: 50 },
            { name: 'PRO', limit: 500 },
            { name: 'ENTERPRISE', limit: 1500 }
        ];

        for (const p of plansToFix) {
            const plan = await Plan.findOne({ planName: p.name });
            if (plan) {
                if (plan.maxCertificatesPerMonth !== p.limit) {
                    console.log(`Updating ${p.name} limit from ${plan.maxCertificatesPerMonth} to ${p.limit}`);
                    plan.maxCertificatesPerMonth = p.limit;
                    await plan.save();
                } else {
                    console.log(`${p.name} limit is already ${p.limit}`);
                }
            } else {
                console.log(`Plan ${p.name} not found!`);
                // Optionally create it? For now just log
            }
        }

        // 2. Fix Existing Organizations
        console.log('Fixing Organizations...');
        const orgs = await Organization.find({}).populate('planId');

        for (const org of orgs) {
            let limitShouldBe = 50; // default
            let planName = org.subscriptionPlan;

            // Check populated plan first
            if (org.planId && org.planId.maxCertificatesPerMonth) {
                limitShouldBe = org.planId.maxCertificatesPerMonth;
            } else {
                // Fallback map
                if (planName === 'PRO') limitShouldBe = 500;
                if (planName === 'ENTERPRISE') limitShouldBe = 1500;
            }

            if (org.monthlyCertificateLimit !== limitShouldBe) {
                console.log(`Updating Org ${org.name} (${planName}) limit from ${org.monthlyCertificateLimit} to ${limitShouldBe}`);
                org.monthlyCertificateLimit = limitShouldBe;
                await org.save();
            }
        }

        console.log('Done!');
        process.exit(0);

    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkAndFix();
