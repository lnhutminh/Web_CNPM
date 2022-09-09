const { User } = require("../models/user.model");
const bcrypt = require("bcrypt");
const passport = require("passport");
const getUserInfo = require("../utils/get-user");
const { nanoid } = require("nanoid");
const nodemailer = require("nodemailer");
const sendgridTransport = require("nodemailer-sendgrid");
const { validationResult } = require("express-validator");

const transporter = nodemailer.createTransport(
  sendgridTransport({
    apiKey:
      "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",
  })
);

exports.getLogin = (req, res) => {
  res.render("auth/login", {
    cssP: () => "css",
    headerP: () => "header",
    footerP: () => "footer",
    isLoggedIn: req.user,
    title: "Login",
  });
};

exports.postLogin = (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return res.render("auth/login", {
        cssP: () => "css",
        headerP: () => "header",
        footerP: () => "footer",
        msg: err,
        color: "danger",
        isLoggedIn: req.user,
        title: "Login",
      });
    }
    if (!user) {
      return res.render("auth/login", {
        cssP: () => "css",
        headerP: () => "header",
        footerP: () => "footer",
        msg: "Invalid Email or Password. Try Again",
        color: "danger",
        isLoggedIn: req.user,
        title: "Login",
      });
    }
    req.logIn(user, function (err) {
      if (err) {
        return res.render("auth/login", {
          cssP: () => "css",
          headerP: () => "header",
          footerP: () => "footer",
          msg: err,
          color: "danger",
          isLoggedIn: req.user,
          title: "Login",
        });
      }
      return res.redirect("/");
    });
  })(req, res, next);
};

exports.getSignup = (req, res) => {
  res.render("auth/signup", {
    cssP: () => "css",
    headerP: () => "header",
    footerP: () => "footer",
    isLoggedIn: req.user,
    title: "Sign Up",
  });
};

exports.postSignup = async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const type = req.body.type;

  let user = await User.findOne({ email: email });

  if (user) {
    return res.render("auth/signup", {
      cssP: () => "css",
      headerP: () => "header",
      footerP: () => "footer",
      color: "danger",
      msg: "User already exists. Try again.",
      isLoggedIn: req.user,
      title: "Sign Up",
    });
  }
  const hasedPassword = await bcrypt.hash(password, 12);

  user = new User({
    email: email,
    password: hasedPassword,
    permission: type,
  });

  user
    .save()
    .then(() => {
      res.render("auth/signup-user-info", {
        cssP: () => "css",
        headerP: () => "header",
        footerP: () => "footer",
        isLoggedIn: req.user,
        email: user.email,
        title: "Sign Up",
      });
    })
    .catch((err) => {
      res.render("auth/signup", {
        cssP: () => "css",
        headerP: () => "header",
        footerP: () => "footer",
        color: "danger",
        msg: err,
        isLoggedIn: req.user,
        title: "Sign Up",
      });
    });
};

exports.postSignupInfo = async (req, res) => {
  const errors = validationResult(req);
  const fname = req.body.fname;
  const lname = req.body.lname;
  const dob = req.body.dob;
  const phone = req.body.phone;

  if (!errors.isEmpty()) {
    return res.render("auth/signup-user-info", {
      cssP: () => "css",
      headerP: () => "header",
      footerP: () => "footer",
      isLoggedIn: req.user,
      fname: fname,
      lname: lname,
      dob: dob,
      phone: phone,
      errorMessage: errors.array(),
      title: "Sign Up",
    });
  }

  const user = await User.findOne({ email: req.body.email });
  user.first_name = fname;
  user.last_name = lname;
  user.DOB = dob;
  user.phone = phone;

  user
    .save()
    .then(() => {
      res.render("auth/login", {
        cssP: () => "css",
        headerP: () => "header",
        footerP: () => "footer",
        isLoggedIn: req.user,
        color: "success",
        msg: "Register Successfully",
        title: "Login",
      });
    })
    .catch((err) => {
      res.render("auth/signup-user-info", {
        cssP: () => "css",
        headerP: () => "header",
        footerP: () => "footer",
        isLoggedIn: req.user,
        color: "danger",
        msg: err,
        title: "Sign Up",
      });
    });
};

exports.getChangePassword = (req, res) => {
  const user = getUserInfo(req.user);
  if (req.user === undefined) {
    return res.render("auth/login", {
      cssP: () => "css",
      headerP: () => "header",
      footerP: () => "footer",
      isLoggedIn: req.user,
      msg: "Please log in first",
      color: "danger",
      title: "Login",
    });
  }
  res.render("auth/change-password", {
    cssP: () => "css",
    headerP: () => "header",
    footerP: () => "footer",
    isLoggedIn: req.user,
    user: user,
    title: "Change Password",
  });
};

exports.getResetPassword = (req, res) => {
  res.render("auth/reset-password", {
    cssP: () => "css",
    headerP: () => "header",
    footerP: () => "footer",
    isSendEmail: false,
    isLoggedIn: req.user,
    title: "Reset Password",
  });
};

exports.getNewPassword = async (req, res) => {
  const email = req.query.email;
  const otp = nanoid(6).toUpperCase();

  const user = await User.findOneAndUpdate(
    { email: email },
    { secretOTP: otp }
  );
  if (!user) {
    return res.render("auth/reset-password", {
      cssP: () => "css",
      headerP: () => "header",
      footerP: () => "footer",
      isSendEmail: false,
      isLoggedIn: req.user,
      color: "danger",
      msg: "Invalid user. Try again",
      title: "Reset Password",
    });
  }

  //send OTP here
  transporter
    .sendMail({
      to: email,
      from: "19120581@student.hcmus.edu.vn",
      subject: "Reset password OTP",
      html: `
        <html>
          <p>Use this OTP below to reset your password.</p>
          <h2 style="color:red">${otp}</h2>
        </html>
      `,
    })
    .then((data) => {
      return res.render("auth/reset-password", {
        cssP: () => "css",
        headerP: () => "header",
        footerP: () => "footer",
        isSendEmail: true,
        isLoggedIn: req.user,
        email: email,
        title: "Reset Password",
      });
    })
    .catch((err) => {
      return res.render("auth/reset-password", {
        cssP: () => "css",
        headerP: () => "header",
        footerP: () => "footer",
        isSendEmail: false,
        isLoggedIn: req.user,
        color: "danger",
        msg: err,
        title: "Reset Password",
      });
    });
};

exports.postNewPassword = async (req, res) => {
  const otp = req.body.otp;
  const email = req.body.email;
  const newPassword = req.body.new_password;

  const hashedPassword = await bcrypt.hash(newPassword, 12);

  const user = await User.findOneAndUpdate(
    { email, secretOTP: otp },
    { password: hashedPassword, secretOTP: "" }
  );

  if (!user) {
    return res.render("auth/reset-password", {
      cssP: () => "css",
      headerP: () => "header",
      footerP: () => "footer",
      isSendEmail: true,
      isLoggedIn: req.user,
      msg: "Incorrect OTP. Try again.",
      color: "danger",
      title: "Reset Password",
    });
  }

  res.render("auth/login", {
    cssP: () => "css",
    headerP: () => "header",
    footerP: () => "footer",
    isLoggedIn: req.user,
    color: "success",
    msg: "Change Password Successfully",
    title: "Login",
  });
};

exports.logout = (req, res) => {
  if (req.user) {
    req.logOut();
  }
  return res.redirect("/");
};
