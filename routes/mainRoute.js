const router = require("express").Router();
const mainController = require("../controllers/mainController");
const isStudent = require("../middleware/is-student");
const { body } = require("express-validator");

router.get("/", mainController.getIndex);

router.get("/course-detail/:id", mainController.getCourse);

router.get("/mylearning", isStudent, mainController.getMyLearning);

router.get("/mylearning/:id", isStudent, mainController.getMyCourse);

router.post("/mylearning/:id", isStudent, mainController.postMyComment);

//router.get('/cart', isStudent, mainController.getCart);

//router.get('/checkout', isStudent, mainController.getCheckout);

router.get("/update-info", mainController.getUpdateInfo);

router.post("/update-info", mainController.editProfile);

router.get("/mylearning/lesson/:id", isStudent, mainController.getLesson);

router.get("/change-avatar", (req, res) => {
  res.redirect("/");
});
router.post(
  "/change-avatar",
  [
    body("image", "Image must not be empty").custom((value, { req }) => {
      if (!req.file) return false;
      return true;
    }),
    body(
      "image",
      "Invalid image type. File must be an image (png, jpg, jpeg)"
    ).custom((value, { req }) => {
      if (!req.file) return true;
      if (
        req.file.mimetype === "image/png" ||
        req.file.mimetype === "image/jpg" ||
        req.file.mimetype === "image/jpeg"
      )
        return true;
      return false;
    }),
  ],
  mainController.changeAvatar
);

module.exports = router;
