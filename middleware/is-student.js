module.exports = (req, res, next) => {
  if (req.user && req.user.permission !== "Student") {
    return res.redirect("/");
  }
  next();
};
