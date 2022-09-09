const router = require("express").Router();
const teacherController = require("../controllers/teacherController");
const isTeacher = require("../middleware/is-teacher");
const { body } = require("express-validator");

router.get("/myteaching", isTeacher, teacherController.getMyTeaching);

router.get(
  "/myteaching/:courseId",
  isTeacher,
  teacherController.getCourseDetail
);

router.get("/add-course", isTeacher, teacherController.getAddCourse);

router.post(
  "/add-course",
  [
    body(
      "course_name",
      "Course Name must have at least 10 characters long."
    ).isLength({ min: 10 }),
    body(
      "description",
      "Description must have at least 20 characters long."
    ).isLength({ min: 20 }),
    body("image", "File must be an image (png, jpg, jpeg)").custom(
      (value, { req }) => {
        if (
          req.file.mimetype === "image/png" ||
          req.file.mimetype === "image/jpg" ||
          req.file.mimetype === "image/jpeg"
        )
          return true;
        return false;
      }
    ),
    body("category", "Category must not be empty.").isLength({ min: 1 }),
    body("discount", "Discount must not greater than Price.").custom(
      (value, { req }) => {
        const discount = parseFloat(value);
        const price = parseFloat(req.body.price);
        if (discount > price) return false;
        return true;
      }
    ),
    body("discount", "Choose the discount.").custom((value, { req }) => {
      if (req.body.type === "Paid") if (value === undefined) return false;
      return true;
    }),
    body("price", "Choose the price.").custom((value, { req }) => {
      if (req.body.type === "Paid") if (value === undefined) return false;
      return true;
    }),
  ],
  isTeacher,
  teacherController.postAddCourse
);

router.get("/delete-course/:id", isTeacher, teacherController.getDeleteCourse);

router.get("/edit/:id", isTeacher, teacherController.getEditCourse);

router.post(
  "/edit",
  [
    body(
      "course_name",
      "Course Name must have at least 10 characters long."
    ).isLength({ min: 10 }),
    body(
      "description",
      "Description must have at least 20 characters long."
    ).isLength({ min: 20 }),
    body("category", "Category must not be empty.").isLength({ min: 1 }),
    body("discount", "Discount must not greater than Price.").custom(
      (value, { req }) => {
        const discount = parseFloat(value);
        const price = parseFloat(req.body.price);
        if (discount > price) return false;
        return true;
      }
    ),
    body("discount", "Choose the discount.").custom((value, { req }) => {
      if (req.body.type === "Paid") if (value === undefined) return false;
      return true;
    }),
    body("price", "Choose the price.").custom((value, { req }) => {
      if (req.body.type === "Paid") if (value === undefined) return false;
      return true;
    }),
  ],
  isTeacher,
  teacherController.postEditCourse
);

router.post(
  "/update-course-img",
  [
    body("image", "File cannot be empty").custom((value, { req }) => {
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
  isTeacher,
  teacherController.updateCourseImg
);

router.post(
  "/add-lesson",
  [
    body("title", "Title must not be empty").isLength({
      min: 1,
    }),
    body("description", "Description must not be empty").isLength({ min: 1 }),
    body("video", "Video must not be empty").custom((value, { req }) => {
      if (!req.file) return false;
      return true;
    }),
    body(
      "video",
      "Invalid video type. File must be an video (mp4, avi, mov, wmv, mpeg)"
    ).custom((value, { req }) => {
      if (!req.file) return true;
      if (
        req.file.mimetype === "video/mp4" ||
        req.file.mimetype === "video/avi" ||
        req.file.mimetype === "video/mov" ||
        req.file.mimetype === "video/wmv" ||
        req.file.mimetype === "video/mpeg"
      )
        return true;
      return false;
    }),
  ],
  isTeacher,
  teacherController.postAddLesson
);

router.get("/myteaching/lesson/:id", isTeacher, teacherController.getLesson);

router.post(
  "/myteaching/lesson/add-document",
  isTeacher,
  teacherController.addDocument
);

router.get(
  "/myteaching/lesson/:lessonId/delete-document/:docId",
  isTeacher,
  teacherController.deleteDocument
);

router.post(
  "/myteaching/lesson/change-video",
  [
    body("video", "Video must not be empty").custom((value, { req }) => {
      if (!req.file) return false;
      return true;
    }),
    body("video", "File must be an video (mp4, avi, mov, wmv, mpeg)").custom(
      (value, { req }) => {
        if (!req.file) return true;
        if (
          req.file.mimetype === "video/mp4" ||
          req.file.mimetype === "video/avi" ||
          req.file.mimetype === "video/mov" ||
          req.file.mimetype === "video/wmv" ||
          req.file.mimetype === "video/mpeg"
        )
          return true;
        return false;
      }
    ),
  ],
  isTeacher,
  teacherController.changeLessonVideo
);

router.post(
  "/myteaching/lesson/edit-lesson",
  [
    body("title", "Title must not be empty").isLength({
      min: 1,
    }),
    body("description", "Description must not be empty").isLength({ min: 1 }),
  ],
  isTeacher,
  teacherController.editLessonInfo
);

router.get(
  "/mylearning/lesson/:id/delete-lesson",
  isTeacher,
  teacherController.deleteLesson
);

module.exports = router;
