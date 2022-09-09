module.exports = (req, res, next) => {
  if (req.user && req.user.permission !== "Admin") {
    return res.redirect("/");
  }
  next();
};
