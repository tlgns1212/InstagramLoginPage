var express = require('express');
var router = express.Router();
const mariadb = require("mariadb");

let pool = mariadb.createPool({
  host: "127.0.0.1", 
  database: "nodejs",
  user: "root",
  port: "3306",
  password: "a123456"
});

pool.getConnection()
    .then(conn => {
      conn.query("select * from user")
        .then(rows => { // rows: [ {val: 1}, meta: ... ]
          return conn.query("INSERT INTO myTable value (?, ?)", [1, "mariadb"]);
        })
        .then(res => { // res: { affectedRows: 1, insertId: 1, warningStatus: 0 }
          conn.release(); // release to pool
        })
        .catch(err => {
          conn.release(); // release to pool
        })
        
    }).catch(err => {
      //not connected
    });

/* GET home page. */
router.get('/', function(req, res, next) {
  console.log('--------------------------')
  res.render('index', { title: 'Express' });
});

router.get('/test', function(req, res, next) {
  console.log('--------------------------')   // 터미널
  res.send('index');
});

router.get('/hello_world', function(req, res, next) {
  res.render("index", {
    lecture: "산업체특강 1주차",
    university: "한기대 컴공",
    name: "김시훈",
    title: "sihoon"
  });
});

module.exports = router;
