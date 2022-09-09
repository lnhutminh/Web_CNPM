const { user } = require("pg/lib/defaults");
const { User } = require("../models/user.model");
const getUserInfo = require("../utils/get-user");
const CoursesModel = require("../models/course.model").Courses;
const Courses = require("../models/course.model");
const { validationResult } = require("express-validator");
const fs = require("fs");
const aws = require("aws-sdk");
const userModel = require("../models/user.model");

const awsConfig = {
  accessKeyId: "AKIA3JZ6GSJ7RJMKBIGD",
  secretAccessKey: "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",
  region: "us-east-2",
  apiVersion: "2011-12-05",
};

const s3 = new aws.S3(awsConfig);

exports.getIndex = async (req, res) => {
  const user = getUserInfo(req.user);
  const allcourses = await Courses.getAllCourse();
  const allteachers = await User.find({ permission: "Teacher" });
  const instructors = await User.find({ permission: "Teacher" }).limit(4);
  const teachers = [];
  const courses = [];

  for (let t of instructors) {
    teachers.push({
      name: t.first_name + " " + t.last_name,
      avatar: t.avatar,
      courseAmount: t.courses.length,
    });
  }

  let n = allcourses.length - 8 >= 0 ? allcourses.length - 8 : 0;
  for (let i = allcourses.length - 1; i >= n; i--) {
    const ts = await User.find({ permission: "Teacher" });
    let teacher;
    for (let t of ts) {
      for (let c of t.courses) {
        if (c._id.toString() === allcourses[i]._id.toString()) {
          teacher = t;
          break;
        }
      }
    }

    courses.push({
      _id: allcourses[i]._id,
      imageUrl: allcourses[i].imageUrl,
      courseName: allcourses[i].courseName,
      studentAmount: allcourses[i].studentAmount,
      rating: allcourses[i].rating,
      price: allcourses[i].price,
      discount: allcourses[i].discount,
      teacher: teacher.first_name + " " + teacher.last_name,
    });
  }

  res.render("home", {
    cssP: () => "css",
    headerP: () => "header",
    footerP: () => "footer",
    courses: courses,
    instructors: teachers.reverse(),
    numCourses: allcourses.length,
    numTeacher: allteachers.length,
    isLoggedIn: req.user,
    user: user,
    title: "Home - Elearning",
  });
};

exports.getCourse = async (req, res) => {
  const user = getUserInfo(req.user);
  const courseId = req.params.id;
  const allteachers = await User.find({ permission: "Teacher" });
  const course = await Courses.getCourseById(courseId);
  console.log(course);
  let teacher;

  for (let t of allteachers) {
    if (t._id.toString() === course[0].teacher.toString()) teacher = t;
  }

  const positiveRating = Math.round(parseFloat(course.rating));
  const negativeRating = 5 - positiveRating;
  res.render("course-detail", {
    course: course[0],
    teacher: teacher.first_name + " " + teacher.last_name,
    //reviews: reviews, // test trước
    positiveRating: positiveRating,
    negativeRating: negativeRating,
    cssP: () => "css",
    headerP: () => "header",
    footerP: () => "footer",
    isLoggedIn: req.user,
    user: user,
    title: course[0].courseName,
  });
};

exports.getMyCourse = async (req, res) => {
  const user = getUserInfo(req.user);
  const courseId = req.params.id;

  const course = await Courses.getCourseById(courseId);
  const allteachers = await User.find({ permission: "Teacher" });
  let teacher;

  for (let t of allteachers) {
    if (t._id.toString() === course[0].teacher.toString()) teacher = t;
  }

  //const positiveRating = Math.round(parseFloat(course[0].rating));
  //const negativeRating = 5 - positiveRating;

  return res.render("my-course-detail", {
    course: course[0],
    teacher: teacher.first_name + " " + teacher.last_name,
    //reviews: reviews, // test trước
    cssP: () => "css",
    headerP: () => "header",
    footerP: () => "footer",
    isLoggedIn: req.user,
    user: user,
    title: course[0].courseName,
  });
};

exports.postMyComment = (req, res) => {
  const user = getUserInfo(req.user);
  const courseId = parseInt(req.params.id);
  const comment = req.body.comment; // Cần thêm cmt mới này vào database
  console.log("courseId: ", courseId);
  console.log("comment: ", comment);
  let resultCourse = null;
  // const resultCourse = await courseController.getCourseById(courseId);
  for (let i = 0; i < courses.length; i++) {
    if (courseId === courses[i].id) {
      resultCourse = courses[i];
      break;
    }
  }

  const positiveRating = Math.round(parseFloat(resultCourse.rating));
  const negativeRating = 5 - positiveRating;
  res.render("my-course-detail", {
    course: resultCourse,
    reviews: reviews, // test trước
    positiveRating: positiveRating,
    negativeRating: negativeRating,
    cssP: () => "css",
    headerP: () => "header",
    footerP: () => "footer",
    isLoggedIn: req.user,
    user: user,
  });
};

exports.getMyLearning = async (req, res) => {
  const user = getUserInfo(req.user);
  if (req.user === undefined) {
    return res.render("auth/login", {
      cssP: () => "css",
      headerP: () => "header",
      footerP: () => "footer",
      isLoggedIn: req.user,
      msg: "Please log in first",
      color: "danger",
      user: user,
      title: "Login",
    });
  }

  let data = await userModel.getUserCourses(req.user.id);
  let { courses } = data[0];
  console.log("data", data);
  console.log(courses);
  let myCourses = [];
  for (let c of courses) {
    let x = await Courses.getCourseById(c._id);
    let y = x[0];
    myCourses = [...myCourses, y];
  }
  console.log(myCourses);
  res.render("mylearning", {
    courses: myCourses,
    cssP: () => "css",
    headerP: () => "header",
    footerP: () => "footer",
    isLoggedIn: req.user,
    user: user,
    title: "My Learning",
  });
};

exports.getUpdateInfo = (req, res) => {
  const user = getUserInfo(req.user);
  if (req.user === undefined) {
    return res.render("auth/login", {
      cssP: () => "css",
      headerP: () => "header",
      footerP: () => "footer",
      msg: "Please log in first",
      color: "danger",
      title: "Login",
    });
  }
  res.render("update-info", {
    cssP: () => "css",
    headerP: () => "header",
    footerP: () => "footer",
    isLoggedIn: req.user,
    user: user,
    title: "Update Information",
  });
};

exports.editProfile = async (req, res) => {
  //edit user information
  const filter = { email: req.user.email };
  const update = {
    first_name: req.body.Fname,
    last_name: req.body.Lname,
    phone: req.body.phone,
    DOB: req.body.dob,
  };
  const newUser = await User.findOneAndUpdate(filter, update);
  res.redirect("/");
};

exports.changeAvatar = async (req, res) => {
  const user = getUserInfo(req.user);
  const userId = req.body.userId;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const allcourses = await Courses.getAllCourse();
    const allteachers = await User.find({ permission: "Teacher" });
    const instructors = await User.find({ permission: "Teacher" }).limit(4);
    const teachers = [];
    const courses = [];

    for (let t of instructors) {
      teachers.push({
        name: t.first_name + " " + t.last_name,
        avatar: t.avatar,
        courseAmount: t.courses.length,
      });
    }

    let n = allcourses.length - 8 >= 0 ? allcourses.length - 8 : 0;
    for (let i = allcourses.length - 1; i >= n; i--) {
      const ts = await User.find({ permission: "Teacher" });
      let teacher;
      for (let t of ts) {
        for (let c of t.courses) {
          if (c._id.toString() === allcourses[i]._id.toString()) {
            teacher = t;
            break;
          }
        }
      }
      courses.push({
        _id: allcourses[i]._id,
        imageUrl: allcourses[i].imageUrl,
        courseName: allcourses[i].courseName,
        studentAmount: allcourses[i].studentAmount,
        rating: allcourses[i].rating,
        price: allcourses[i].price,
        discount: allcourses[i].discount,
        teacher: teacher.first_name + " " + teacher.last_name,
      });
    }

    return res.render("home", {
      cssP: () => "css",
      headerP: () => "header",
      footerP: () => "footer",
      courses: courses,
      instructors: teachers.reverse(),
      numCourses: allcourses.length,
      numTeacher: allteachers.length,
      isLoggedIn: req.user,
      user: user,
      isShow: true,
      color: "danger",
      errorMessage: errors.array(),
      title: "Home - Elearning",
    });
  }

  let image = req.file;
  let imagePath;

  if (image) {
    imagePath = image.path;
  }

  const u = await User.findById(userId);

  if (
    u.avatar !==
    "https://thelifetank.com/wp-content/uploads/2018/08/avatar-default-icon.png"
  ) {
    const deleteParams = {
      Bucket: "elearning-bucket2",
      Key: u.avt_file,
    };

    s3.deleteObject(deleteParams, (err, data) => {
      if (err) console.log(err);
    });
  }

  const fileStream = fs.createReadStream(imagePath);

  const params = {
    Bucket: "elearning-bucket2",
    Body: fileStream,
    Key: image.filename,
  };

  s3.upload(params, (err, data) => {
    fs.unlink(`./${imagePath}`, (err) => {
      if (err) console.log(err);
    });

    User.findByIdAndUpdate(userId, {
      avt_file: image.filename,
      avatar: data.Location,
    })
      .then(() => {
        return res.redirect("/");
      })
      .catch((err) => console.log(err));
  });
};

exports.getLesson = async (req, res) => {
  const user = getUserInfo(req.user);
  const lessonId = req.params.id;

  const lesson = await Courses.getSingleLesson(lessonId);

  let otherlessons = await Courses.getAllLessonById(lessonId);

  otherlessons = otherlessons.filter(
    (l) => l._id.toString() !== lessonId.toString()
  );

  otherlessons = otherlessons.slice(0, 4);

  return res.render("lesson", {
    cssP: () => "css",
    headerP: () => "header",
    footerP: () => "footer",
    user: user,
    lesson: lesson,
    otherlessons: otherlessons,
    isLoggedIn: req.user,
    title: lesson.title,
  });
};
