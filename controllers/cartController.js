const Course = require("../models/course.model");
const User = require("../models/user.model");
const UserModel = require("../models/user.model").User;
const getUserInfo = require("../utils/get-user");
const { validationResult } = require("express-validator");

module.exports = {
  getCart: async function (req, res) {
    const user = getUserInfo(req.user);

    //render if no loggin
    if (req.user === undefined) {
      return res.render("auth/login", {
        cssP: () => "css",
        headerP: () => "header",
        footerP: () => "footer",
        msg: "Please log in first",
        isLoggedIn: req.user,
        color: "danger",
        user: user,
        title: "Login",
      });
    }

    //if logged in
    let totalPrice = 0;
    let coursesId = req.session.cart;
    let courses = [];
    for (let ci of coursesId) {
      let singleCourse = await Course.getCourseById(ci);
      //console.log(singleCourse); //lay course thanh cong
      //console.log(singleCourse);
      courses = [...courses, singleCourse[0]];
      totalPrice += parseFloat(singleCourse[0].price);
      //console.log(courses);
      //console.log(typeof courses);
    }
    //console.log(typeof coursesId);

    res.render("cart", {
      cssP: () => "css",
      headerP: () => "header",
      footerP: () => "footer",
      courses: courses,
      numCourses: courses.length,
      totalPrice: totalPrice.toFixed(2),
      isLoggedIn: req.user,
      user: user,
      title: "Cart",
    });
    // res.render('search', {
    // 	cssP: () => 'css',
    // 	headerP: () => 'header',
    // 	footerP: () => 'footer',
    // 	courses: courses,
    // 	keyword: '123',
    // 	isLoggedIn: req.user,
    // 	user: user
    // });
  },

  addToCart: async function (req, res) {
    const courseId = req.body.courseId;
    //if course already in cart
    const cart = req.session.cart;
    for (let i of cart) {
      if (i === courseId) {
        return res.redirect("/cart");
      }
    }
    // if (cart.include(courseId)) {
    // 	res.redirect('/cart');
    // }
    req.session.cart = [...req.session.cart, courseId];
    //console.log(req.session.cart);
    res.redirect("/cart");
  },

  delFromCart: async function (req, res) {
    const courseId = req.body.courseId;
    console.log(courseId);

    if (req.session.cart) {
      req.session.cart = req.session.cart.filter((id) => id !== courseId);
    }
    console.log(req.session.cart);
    res.redirect("/cart");
  },

  postCheckout: async function (req, res) {
    let isSuccessful = false;
    const cart = req.session.cart;
    const user = getUserInfo(req.user);
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.render("checkout", {
        cssP: () => "css",
        headerP: () => "header",
        footerP: () => "footer",
        fullname: req.body.fullname,
        email: req.body.email,
        card_number: req.body.card_number,
        card_name: req.body.card_name,
        start_month: req.body.start_month,
        start_year: req.body.start_year,
        exp_month: req.body.exp_month,
        exp_year: req.body.exp_year,
        security: req.body.security,
        isLoggedIn: req.user,
        user: user,
        errorMessage: errors.array(),
        title: "Checkout",
      });
    }

    for (ci of cart) {
      console.log(ci);
      await User.enrollCourse(ci, req.user._id);
    }
    req.session.cart = [];
    res.redirect("/mylearning");
  },

  getCheckout: async function (req, res) {
    const user = getUserInfo(req.user);

    return res.render("checkout", {
      cssP: () => "css",
      headerP: () => "header",
      footerP: () => "footer",
      isLoggedIn: req.user,
      user: user,
      title: "Checkout",
    });
  },

  enrollFreeCourse: async function (req, res) {
    await User.enrollCourse(req.body.courseId, req.user.id);
    res.redirect("/mylearning");
  },
};
