const Course = require("../models/course.model");
const mongoose = require("mongoose");
const getUserInfo = require("../utils/get-user");
const UserModel = require("../models/user.model").User;

module.exports = {
  getAllCourse: async function (req, res) {},

  search: async function (req, res) {
    let query = req.query.keyword;
    const user = getUserInfo(req.user);
    let courses = query ? await Course.search(query) : [];
    for (let i = 0; i < courses.length; i++) {
      const ts = await UserModel.find({ permission: "Teacher" });
      let teacher;
      for (let t of ts) {
        for (let c of t.courses) {
          if (c._id.toString() === courses[i]._id.toString()) {
            teacher = t;
            break;
          }
        }
      }
      courses[i].teacher = teacher.first_name + " " + teacher.last_name;
    }

    res.render("search", {
      cssP: () => "css",
      headerP: () => "header",
      footerP: () => "footer",
      courses: courses,
      coursesLength: courses.length,
      keyword: query,
      isLoggedIn: req.user,
      user: user,
      title: "Searching",
    });
  },
};
