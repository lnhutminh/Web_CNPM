const router = require("express").Router();
const authController = require("../controllers/authController");
const { body } = require("express-validator");

router.get("/login", authController.getLogin);
router.post("/login", authController.postLogin);

router.get("/signup", authController.getSignup);
router.post("/signup", authController.postSignup);

router.post(
  "/signup/info",
  [
    body("fname", "First name can not be empty").isLength({ min: 1 }),
    body("lname", "Last name can not be empty").isLength({ min: 1 }),
    body("phone", "Phone must have at least 6 characters long").isLength({
      min: 6,
    }),
    body("phone", "Phone must be a number").isNumeric(),
    body("dob", "Choose a day of birth").custom((value, { req }) => {
      if (value === "") return false;
      return true;
    }),
    body("dob", "Date must less than current date").custom((value, { req }) => {
      if (value === "") return true;
      const time = new Date();
      const current = new Date(
        time.getFullYear(),
        time.getMonth(),
        time.getDate()
      );
      const input = new Date(value);
      if (input > current) return false;
      return true;
    }),
  ],
  authController.postSignupInfo
);

router.get("/change-password", authController.getChangePassword);
router.get("/reset-password", authController.getResetPassword);
router.get("/new-password", authController.getNewPassword);
router.post("/new-password", authController.postNewPassword);

router.get("/logout", authController.logout);

module.exports = router;
