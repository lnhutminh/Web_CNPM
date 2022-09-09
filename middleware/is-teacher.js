module.exports = (req, res, next) => {
  if ((req.user && req.user.permission !== "Teacher") || !req.user) {
    return res.redirect("/");
  }
  next();
};
