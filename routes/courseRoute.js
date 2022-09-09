const router = require('express').Router();
const courseController = require('../controllers/courseController');

//Lỗi
// router.get("/", courseController.allCourse);
// router.get("/:id", courseController.getCourseById);
router.get('/search', courseController.search);
module.exports = router;
