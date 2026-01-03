const express = require("express");
const router = express.Router();
const { issueCertificate, getCertificates } = require("../controllers/certificateController");
const auth = require("../middlewares/authMiddleware");

router.post("/", auth, issueCertificate);
router.get("/", auth, getCertificates);

module.exports = router;

