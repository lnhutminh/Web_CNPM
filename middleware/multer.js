const multer = require("multer");

module.exports = (app) => {
  const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, "files"),
    filename: (req, file, cb) =>
      cb(
        null,
        new Date().toISOString().replace(/:/g, "-") + "-" + file.originalname
      ),
  });

  app.use(multer({ storage: fileStorage }).single("file"));
};
