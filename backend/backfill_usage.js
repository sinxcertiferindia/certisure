const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const { Organization, Certificate } = require('./models');

const backfillUsage = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        console.log('Counting certificates since:', startOfMonth);

        const orgs = await Organization.find({});

        for (const org of orgs) {
            // Count certificates created this month
            const count = await Certificate.countDocuments({
                orgId: org._id,
                createdAt: { $gte: startOfMonth }
            });

            console.log(`Org: ${org.name} | Plan: ${org.subscriptionPlan} | Limit: ${org.monthlyCertificateLimit} | This Month: ${count}`);

            // Update the organization
            org.certificatesIssuedThisMonth = count;

            // Double check limit while we are here
            let limitShouldBe = 50;
            if (org.subscriptionPlan === 'PRO') limitShouldBe = 500;
            if (org.subscriptionPlan === 'ENTERPRISE') limitShouldBe = 1500;

            // If we have a custom planId linked limit, respect it (unless it's null)
            // For now, assuming standard plans based on user request "plan ke hisaab se"
            if (['PRO', 'ENTERPRISE', 'FREE'].includes(org.subscriptionPlan)) {
                if (org.monthlyCertificateLimit !== limitShouldBe) {
                    console.log(` -> Fixing limit to ${limitShouldBe}`);
                    org.monthlyCertificateLimit = limitShouldBe;
                }
            }

            await org.save();
        }

        console.log('Backfill complete!');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

backfillUsage();
