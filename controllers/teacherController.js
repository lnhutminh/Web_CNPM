const getUserInfo = require("../utils/get-user");
const CoursesModel = require("../models/course.model").Courses;
const Courses = require("../models/course.model");
const User = require("../models/user.model").User;
const { validationResult } = require("express-validator");
const fs = require("fs");
const mongoose = require("mongoose");
const aws = require("aws-sdk");

const awsConfig = {
  accessKeyId: "AKIA3JZ6GSJ7RJMKBIGD",
  secretAccessKey: "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",
  region: "us-east-2",
  apiVersion: "2011-12-05",
};

const s3 = new aws.S3(awsConfig);

exports.getMyTeaching = async (req, res) => {
  const user = getUserInfo(req.user);
  const courses = await Courses.getCourseByTeacher(req.user._id);

  res.render("teacher/myteaching", {
    cssP: () => "css",
    headerP: () => "header",
    footerP: () => "footer",
    courses: courses,
    isLoggedIn: req.user,
    user: user,
    title: "My Teaching",
  });
};

exports.getAddCourse = (req, res) => {
  const user = getUserInfo(req.user);

  return res.render("teacher/add-course", {
    cssP: () => "css",
    headerP: () => "header",
    footerP: () => "footer",
    isLoggedIn: req.user,
    user: user,
    title: "Add Course",
  });
};

exports.postAddCourse = (req, res) => {
  const user = getUserInfo(req.user);
  const errors = validationResult(req);
  let image = req.file;
  let imagePath;

  if (image) {
    imagePath = image.path;
  }

  if (!errors.isEmpty()) {
    if (image !== undefined) {
      fs.unlink(`./${imagePath}`, (err) => {
        if (err) console.log(err);
      });
    }
    return res.status(422).render("teacher/add-course", {
      cssP: () => "css",
      headerP: () => "header",
      footerP: () => "footer",
      course_name: req.body.course_name,
      description: req.body.description,
      type: req.body.type,
      price: req.body.price,
      discount: req.body.discount,
      category: req.body.category,
      errorMessage: errors.array(),
      user: user,
      isLoggedIn: req.user,
      title: "Add Course",
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

    let price;
    if (req.body.type === "free") price = 0;
    else price = parseFloat(req.body.price) - parseFloat(req.body.discount);

    const course = {
      courseName: req.body.course_name,
      des: req.body.description,
      price: price.toFixed(2),
      discount: req.body.discount,
      category: req.body.category,
      image: image.filename,
      imageUrl: data.Location,
      teacher: req.user,
    };

    Courses.addCourse(course)
      .then(async (newcourse) => {
        const us = await User.findById(user._id);
        us.courses = [...us.courses, newcourse];
        return us.save();
      })
      .then(() => {
        return res.redirect("/myteaching");
      })
      .catch(async (err) => {
        const courses = await Courses.getCourseByTeacher(req.user._id);
        return res.render("teacher/myteaching", {
          cssP: () => "css",
          headerP: () => "header",
          footerP: () => "footer",
          user: user,
          isLoggedIn: req.user,
          msg: err,
          color: "danger",
          courses: courses,
          title: "My Teaching",
        });
      });
  });
};

exports.getCourseDetail = async (req, res) => {
  const user = getUserInfo(req.user);
  const courseId = req.params.courseId;

  const course = await Courses.getCourseById(courseId);
  return res.render("teacher/course-detail", {
    cssP: () => "css",
    headerP: () => "header",
    footerP: () => "footer",
    user: user,
    isLoggedIn: req.user,
    course: course[0],
    courseId: courseId,
    title: course[0].courseName,
  });
};

exports.getDeleteCourse = async (req, res) => {
  const courseId = req.params.id;
  const course = await Courses.getCourseById(courseId);

  const params = {
    Bucket: "elearning-bucket2",
    Key: course[0].image,
  };

  s3.deleteObject(params, (err, data) => {
    if (err) console.log(err);
  });

  const rs = await Courses.deleteCourse(courseId);
  const user = await User.findById(req.user._id);

  user.courses = user.courses.filter((c) => c._id.toString() !== courseId);
  user
    .save()
    .then(() => {
      return res.redirect("/myteaching");
    })
    .catch((err) => console.log(err));
};

exports.getEditCourse = async (req, res) => {
  const user = getUserInfo(req.user);
  const courseId = req.params.id;

  const course = await Courses.getCourseById(courseId);

  return res.render("teacher/edit-course", {
    cssP: () => "css",
    headerP: () => "header",
    footerP: () => "footer",
    user: user,
    isLoggedIn: req.user,
    course: course[0],
    courseId: courseId,
    title: "Edit Course",
  });
};

exports.postEditCourse = async (req, res) => {
  const user = getUserInfo(req.user);
  const errors = validationResult(req);
  const courseId = req.body.courseId;

  let price;
  price = parseFloat(req.body.price) - parseFloat(req.body.discount);

  const course = {
    courseName: req.body.course_name,
    des: req.body.description,
    price: price.toFixed(2),
    discount: req.body.discount,
    category: req.body.category,
  };

  if (!errors.isEmpty()) {
    return res.status(422).render("teacher/edit-course", {
      cssP: () => "css",
      headerP: () => "header",
      footerP: () => "footer",
      course: course,
      errorMessage: errors.array(),
      user: user,
      isLoggedIn: req.user,
      title: "Edit Course",
    });
  }

  CoursesModel.findByIdAndUpdate(courseId, {
    courseName: course.courseName,
    des: course.des,
    price: course.price,
    discount: course.discount,
    category: course.category,
  })
    .then(() => {
      return res.redirect(`/myteaching/${courseId}`);
    })
    .catch((err) => console.log(err));
};

exports.updateCourseImg = async (req, res) => {
  const user = getUserInfo(req.user);
  const errors = validationResult(req);
  const courseId = req.body.courseId;
  let image = req.file;
  let imagePath;

  if (image) {
    imagePath = image.path;
  }

  const course = await Courses.getCourseById(courseId);

  if (!errors.isEmpty()) {
    return res.status(422).render("teacher/course-detail", {
      cssP: () => "css",
      headerP: () => "header",
      footerP: () => "footer",
      user: user,
      isLoggedIn: req.user,
      course: course[0],
      courseId: courseId,
      color: "danger",
      msg: errors.array()[0].msg,
      title: course[0].courseName,
    });
  }

  const deleteParams = {
    Bucket: "elearning-bucket2",
    Key: course[0].image,
  };

  s3.deleteObject(deleteParams, (err, data) => {
    if (err) console.log(err);
  });

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

    CoursesModel.findByIdAndUpdate(courseId, {
      image: image.filename,
      imageUrl: data.Location,
    })
      .then(async () => {
        return res.redirect(`/myteaching/${courseId}`);
      })
      .catch(async (err) => {
        console.log(err);
      });
  });
};

exports.postAddLesson = async (req, res) => {
  const user = getUserInfo(req.user);
  const errors = validationResult(req);
  const courseId = req.body.courseId;
  const title = req.body.title;
  const description = req.body.description;
  const video = req.file;
  let videoPath;

  if (video) {
    videoPath = video.path;
  }

  const course = await Courses.getCourseById(courseId);

  if (!errors.isEmpty()) {
    if (video) {
      fs.unlink(`./${videoPath}`, (err) => {
        if (err) console.log(err);
      });
    }
    return res.render("teacher/course-detail", {
      cssP: () => "css",
      headerP: () => "header",
      footerP: () => "footer",
      lessontitle: title,
      description: description,
      user: user,
      isLoggedIn: req.user,
      course: course[0],
      courseId: courseId,
      autoshow: true,
      color: "danger",
      errorMessage: errors.array(),
      title: course[0].courseName,
    });
  }

  const fileStream = fs.createReadStream(videoPath);

  const params = {
    Bucket: "elearning-bucket2",
    Body: fileStream,
    Key: video.filename,
  };

  s3.upload(params, (err, data) => {
    fs.unlink(`./${videoPath}`, (err) => {
      if (err) console.log(err);
    });

    CoursesModel.findOneAndUpdate(
      { _id: courseId },
      {
        $push: {
          lessons: {
            title,
            des: description,
            video: video.filename,
            videoUrl: data.Location,
          },
        },
      }
    )
      .then(async () => {
        return res.redirect(`/myteaching/${courseId}`);
      })
      .catch((err) => {
        fs.unlink(`./${videoPath}`, (err) => {
          if (err) console.log(err);
        });
        console.log(err);
      });
  });
};

exports.getLesson = async (req, res) => {
  const user = getUserInfo(req.user);
  const lessonId = req.params.id;

  const lesson = await Courses.getSingleLesson(lessonId);

  return res.render("teacher/lesson", {
    cssP: () => "css",
    headerP: () => "header",
    footerP: () => "footer",
    user: user,
    lesson: lesson,
    isLoggedIn: req.user,
    title: lesson.title,
  });
};

exports.addDocument = async (req, res) => {
  const user = getUserInfo(req.user);
  const lessonId = req.body.lessonId;
  const file = req.file;
  let filePath;

  if (file) {
    filePath = file.path;
  }

  const fileStream = fs.createReadStream(filePath);

  const params = {
    Bucket: "elearning-bucket2",
    Body: fileStream,
    Key: file.filename,
  };

  s3.upload(params, async (err, data) => {
    fs.unlink(`./${filePath}`, (err) => {
      if (err) console.log(err);
    });

    const lessons = await Courses.getAllLessonById(lessonId);

    for (let l of lessons) {
      if (l._id.toString() === lessonId) {
        l.documents.push({
          id: new mongoose.Types.ObjectId(),
          name: file.originalname,
          doc: file.filename,
          docUrl: data.Location,
        });
      }
    }

    CoursesModel.findOneAndUpdate(
      { "lessons._id": lessonId },
      { lessons: lessons }
    )
      .then(async () => {
        return res.redirect(`/myteaching/lesson/${lessonId}`);
      })
      .catch((err) => {
        fs.unlink(`./${filePath}`, (err) => {
          if (err) console.log(err);
        });
        console.log(err);
      });
  });
};

exports.deleteDocument = async (req, res) => {
  const docId = req.params.docId;
  const lessonId = req.params.lessonId;
  let document;

  const lesson = await Courses.getSingleLesson(lessonId);

  for (d of lesson.documents) {
    if (d.id.toString() === docId) document = d;
  }

  const params = {
    Bucket: "elearning-bucket2",
    Key: document.doc,
  };

  s3.deleteObject(params, (err, data) => {
    if (err) console.log(err);
  });

  const lessons = await Courses.getAllLessonById(lessonId);

  for (let l of lessons) {
    if (l._id.toString() === lessonId) {
      l.documents = l.documents.filter((d) => d.id.toString() !== docId);
    }
  }

  CoursesModel.findOneAndUpdate(
    { "lessons._id": lessonId },
    { lessons: lessons }
  )
    .then(() => {
      return res.redirect(`/myteaching/lesson/${lessonId}`);
    })
    .catch((err) => console.log(err));
};

exports.changeLessonVideo = async (req, res) => {
  const user = getUserInfo(req.user);
  const lessonId = req.body.lessonId;
  const errors = validationResult(req);
  let video = req.file;

  let videoPath;

  if (video) {
    videoPath = video.path;
  }

  const lesson = await Courses.getSingleLesson(lessonId);

  if (!errors.isEmpty()) {
    if (video) {
      fs.unlink(`./${videoPath}`, (err) => {
        if (err) console.log(err);
      });
    }
    return res.status(422).render("teacher/lesson", {
      cssP: () => "css",
      headerP: () => "header",
      footerP: () => "footer",
      user: user,
      isLoggedIn: req.user,
      lesson: lesson,
      autoshow: true,
      errorMessage: errors.array(),
      title: lesson.title,
    });
  }

  const deleteParams = {
    Bucket: "elearning-bucket2",
    Key: lesson.video,
  };

  s3.deleteObject(deleteParams, (err, data) => {
    if (err) console.log(err);
  });

  const fileStream = fs.createReadStream(videoPath);

  const params = {
    Bucket: "elearning-bucket2",
    Body: fileStream,
    Key: video.filename,
  };

  s3.upload(params, async (err, data) => {
    fs.unlink(`./${videoPath}`, (err) => {
      if (err) console.log(err);
    });

    const lessons = await Courses.getAllLessonById(lessonId);

    for (let l of lessons) {
      if (l._id.toString() === lessonId) {
        l.video = video.filename;
        l.videoUrl = data.Location;
      }
    }

    CoursesModel.findOneAndUpdate(
      { "lessons._id": lessonId },
      { lessons: lessons }
    )
      .then(() => {
        return res.redirect(`/myteaching/lesson/${lessonId}`);
      })
      .catch((err) => console.log(err));
  });
};

exports.editLessonInfo = async (req, res) => {
  const user = getUserInfo(req.user);
  const errors = validationResult(req);
  const newTitle = req.body.title;
  const newDes = req.body.description;
  const lessonId = req.body.lessonId;

  const lesson = await Courses.getSingleLesson(lessonId);

  if (!errors.isEmpty()) {
    return res.status(422).render("teacher/lesson", {
      cssP: () => "css",
      headerP: () => "header",
      footerP: () => "footer",
      user: user,
      isLoggedIn: req.user,
      lesson: lesson,
      autoshowedit: true,
      errorMessage: errors.array(),
      title: lesson.title,
    });
  }

  const lessons = await Courses.getAllLessonById(lessonId);

  for (let l of lessons) {
    if (l._id.toString() === lessonId) {
      l.title = newTitle;
      l.des = newDes;
    }
  }

  CoursesModel.findOneAndUpdate(
    { "lessons._id": lessonId },
    { lessons: lessons }
  )
    .then(() => {
      return res.redirect(`/myteaching/lesson/${lessonId}`);
    })
    .catch((err) => console.log(err));
};

exports.deleteLesson = async (req, res) => {
  const user = getUserInfo(req.user);
  const lessonId = req.params.id;
  let lessons = await Courses.getAllLessonById(lessonId);
  const lesson = await Courses.getSingleLesson(lessonId);
  const title = lesson.tilte;

  lessons = lessons.filter((l) => l._id.toString() !== lessonId);

  const course = await Courses.getCourseByLessonId(lessonId);
  const courseId = course[0]._id;

  const params = {
    Bucket: "elearning-bucket2",
    Key: lesson.video,
  };

  s3.deleteObject(params, (err, data) => {
    if (err) console.log(err);
  });

  CoursesModel.findOneAndUpdate(
    { "lessons._id": lessonId },
    { lessons: lessons }
  )
    .then(async () => {
      const updated = await Courses.getCourseById(courseId);
      return res.status(422).render("teacher/course-detail", {
        cssP: () => "css",
        headerP: () => "header",
        footerP: () => "footer",
        user: user,
        isLoggedIn: req.user,
        course: updated[0],
        courseId: courseId,
        color: "success",
        msg: `Delete lesson successfully`,
        title: updated[0].courseName,
      });
    })
    .catch((err) => console.log(err));
};
