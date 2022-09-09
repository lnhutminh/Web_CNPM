const getUserInfo = require("../utils/get-user");

exports.getManagement = (req, res) => {
  return res.redirect("/management/accounts");
};

exports.getAccountsManagement = (req, res) => {
  const user = getUserInfo(req.user);

  return res.render("admin/account", {
    cssP: () => "css",
    headerP: () => "header",
    footerP: () => "footer",
    isLoggedIn: req.user,
    user: user,
    title: "Account Management",
  });
};

exports.getCoursesManagement = (req, res) => {
  const user = getUserInfo(req.user);

  return res.render("admin/course", {
    cssP: () => "css",
    headerP: () => "header",
    footerP: () => "footer",
    isLoggedIn: req.user,
    user: user,
    title: "Course Management",
  });
};
