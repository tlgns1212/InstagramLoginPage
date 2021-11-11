var express = require("express");
var router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

router.get("/hello-world", function (req, res, next) {
  res.render("hello-world", {
    lecture: "산업체특강 1주차",
    university: "한기대 컴공",
    name: "윤인식",
  });
});

module.exports = router;
