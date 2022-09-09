const router = require("express").Router();
const cartController = require("../controllers/cartController");
const isStudent = require("../middleware/is-student");
const { body } = require("express-validator");

router.get("/cart", isStudent, cartController.getCart);
router.post("/cart/add", isStudent, cartController.addToCart);
router.post("/cart/del", isStudent, cartController.delFromCart);
router.post(
  "/checkout",
  [
    body("fullname", "Full Name cannot be empty").isLength({ min: 1 }),
    body("card_number", "Card Number must have 16 characters long").isLength({
      min: 16,
      max: 16,
    }),
    body("card_name", "Name on Card cannot be empty").isLength({ min: 1 }),
    body("security", "Security Code must have 3 characters long").isLength({
      min: 3,
      max: 3,
    }),
    body("start_month", "Month must be started from 1 to 12").custom(
      (value, { req }) => {
        if (!value) return false;
        if (value < 1 && value > 12) return false;
        return true;
      }
    ),
    body("exp_month", "Month must be started from 1 to 12").custom(
      (value, { req }) => {
        if (!value) return false;
        if (value < 1 && value > 12) return false;
        return true;
      }
    ),
    body("start_year", "Year must be started from 2016").custom(
      (value, { req }) => {
        if (value < 2016) return false;
        return true;
      }
    ),
    body("exp_year", "Year must be started from 2016").custom(
      (value, { req }) => {
        if (value < 2016) return false;
        return true;
      }
    ),
    body("exp_year", "Expiry year must be greater than Start Year").custom(
      (value, { req }) => {
        if (value < 2016) return true;
        if (value > req.body.start_year) return true;
        return false;
      }
    ),
  ],
  isStudent,
  cartController.postCheckout
);
router.get("/checkout", isStudent, cartController.getCheckout);
router.post("/enrollFreeCourse", isStudent, cartController.enrollFreeCourse);
module.exports = router;
