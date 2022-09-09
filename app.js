const express = require("express");
const app = express();
const session = require("express-session");
const handlebars = require("express-handlebars");
const mongoose = require("mongoose");
const path = require("path");
const port = 3000;
const passport = require("./middleware/passport");
const multer = require("./middleware/multer");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));

app.use(
  session({
    secret: "app",
    resave: false,
    saveUninitialized: true,
    cookie: {
      //secure: true
    },
  })
);

const hbs = handlebars.create({
  extname: "hbs",
  helpers: {
    sum: (a, b) => a + b,
    positiveStar: (x, size) => {
      let result = "";
      for (var i = 0; i < x; i++) {
        result += `
                <img src="https://img.icons8.com/fluency/${size}/000000/star.png" class="line-card-image"/>`;
      }
      return result;
    },
    negativeStar: (x, size) => {
      let result = "";
      for (var i = 0; i < x; i++) {
        result += `
                <img src="https://img.icons8.com/color/${size}/000000/star--v1.png" class="line-card-image"/>`;
      }
      return result;
    },
    ifEquals(s1, s2, options) {
      return s1 === s2 ? options.fn(this) : options.inverse(this);
    },
    ifNotEquals(s1, s2, options) {
      return s1 !== s2 ? options.fn(this) : options.inverse(this);
    },
    ifLessThan(s1, s2, options) {
      return s1 < s2 ? options.fn(this) : options.inverse(this);
    },
    getSum(s1, s2) {
      const num1 = parseFloat(s1);
      const num2 = parseFloat(s2);
      return (num1 + num2).toFixed(2);
    },
  },
});
app.engine("hbs", hbs.engine);
app.set("view engine", "hbs");
app.set("views", "./views");

passport(app);
multer(app);

const mainRouter = require("./routes/mainRoute");
const authRouter = require("./routes/authRoute");
const courseRouter = require("./routes/courseRoute");
const teacherRouter = require("./routes/teacherRoute");
const cartRouter = require("./routes/cartRoute");
const adminRouter = require("./routes/adminRoute");

const cartController = require("./controllers/cartController");

app.get("/", function (req, res, next) {
  if (req.session.cart) {
  } else {
    req.session.cart = [];
  }
  next();
});

app.use(mainRouter);
app.use(authRouter);
app.use(courseRouter);
app.use(teacherRouter);
app.use(cartRouter);
app.use(adminRouter);
app.listen(port, () => {
  console.log(`App E-learning is listening at http://localhost:${port}`);
});

//Connect to MongoDB
// mongoose
//   .connect(/*mongodb-URI*/)
//   .then(() => {
//     app.listen(3000);
//   })
//   .catch((err) => console.error(err));

mongoose.connect(
  "mongodb+srv://mongo:7u7U6WhoCx6AjeTo@cluster0.zn0jy.mongodb.net/Elearning?retryWrites=true&w=majority",
  function (err) {
    if (err) {
      console.log("Unable to connect to db");
      return;
    }
    console.log("Connected to DB successfully");
  }
);
