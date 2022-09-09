const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const UserModel = require("../models/user.model").User;
const bcrypt = require("bcrypt");

module.exports = (app) => {
  app.use(passport.initialize());
  app.use(passport.session());
  // LOCAL STRATEGY
  passport.use(
    new LocalStrategy(
      {
        usernameField: "email",
        passwordField: "password",
      },
      async (email, password, done) => {
        try {
          const user = await UserModel.findOne({ email: email });
          if (!user) {
            return done(null, false, { message: "Incorrect email." });
          }
          const challengeResult = await bcrypt.compare(password, user.password);
          if (!challengeResult) {
            return done(null, false, { message: "Incorrect password." });
          }
          return done(null, user);
        } catch (err) {
          return done(err);
        }
      }
    )
  );

  passport.serializeUser(function (user, done) {
    done(null, user);
  });

  passport.deserializeUser(async function (user, done) {
    try {
      const u = await UserModel.findOne({ email: user.email });
      done(null, u);
    } catch (err) {
      done(new Error(), null);
    }
  });
};
