const express = require("express");
const { sendContactEmail } = require("../controllers/contactControllers");

const router = express.Router();

router.post("/contact", sendContactEmail);

module.exports = router;
