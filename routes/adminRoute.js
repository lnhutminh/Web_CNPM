const router = require("express").Router();
const adminController = require("../controllers/adminController");
const isAdmin = require("../middleware/is-admin");

router.get("/management", isAdmin, adminController.getManagement);
router.get("/management/accounts", isAdmin, adminController.getAccountsManagement);
router.get("/management/courses", isAdmin, adminController.getCoursesManagement);

module.exports = router;
