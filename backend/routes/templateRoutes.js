const express = require("express");
const router = express.Router();
const templateController = require("../controllers/templateController");
const emailTemplateController = require("../controllers/emailTemplateController");
const authMiddleware = require("../middlewares/authMiddleware");

const { checkPlanPermission } = require("../middlewares/subscriptionMiddleware");

// All routes require authentication
router.use(authMiddleware);

// Certificate Template Routes
router.post("/certificate", checkPlanPermission('customTemplates'), templateController.createCertificateTemplate);
router.get("/certificate", templateController.getCertificateTemplates);
router.get("/certificate/all", templateController.getAllTemplates); // Master Dashboard
router.get("/certificate/:id", templateController.getCertificateTemplateById);
router.put("/certificate/:id", templateController.updateCertificateTemplate);
router.delete("/certificate/:id", templateController.deleteCertificateTemplate);

// Email Template Routes
router.post("/email", checkPlanPermission('emailTemplates'), emailTemplateController.createEmailTemplate);
router.get("/email", emailTemplateController.getEmailTemplates);
router.get("/email/:id", emailTemplateController.getEmailTemplateById);
router.put("/email/:id", emailTemplateController.updateEmailTemplate);
router.delete("/email/:id", emailTemplateController.deleteEmailTemplate);

module.exports = router;
