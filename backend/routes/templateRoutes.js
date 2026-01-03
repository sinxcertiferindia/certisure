const express = require("express");
const router = express.Router();
const {
  createCertificateTemplate,
  getCertificateTemplates
} = require("../controllers/templateController");

const auth = require("../middlewares/authMiddleware");

router.post("/certificate", auth, createCertificateTemplate);
router.get("/certificate", auth, getCertificateTemplates);

module.exports = router;

