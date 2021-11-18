var express = require('express');
var router = express.Router();
const mariadb = require("mariadb");

let pool = mariadb.createPool({
  host: "127.0.0.1", 
  database: "db-test",
  user: "root",
  port: "3306",
  password: "a123456"
});

//sql 실행 함수
function executeQuery(query) {
  return new Promise(function (resolve) {
    pool
      //db 커넥션 확인
      .getConnection()
      //db 커넥션 잘 되있음.
      .then((conn) => {
        //쿼리 실행
        conn
          .query(query)
          .then((rows) => {
            // query 결과
            resolve(rows);
          })
          .catch((err) => {
            // 풀 해제
            conn.release();
          });
      })
      //db 커넥션 잘 안되있음.
      .catch((err) => {
        console.log(err);
      });
  });
}


/* GET home page. */
router.get("/", async function (req, res, next) {
  //C (create = insert)
  let insertTest = await executeQuery(
    "INSERT INTO comment (list_index, comment, user) VALUE (1, 'insert test!!!!', 'insik')"
  );
  console.log("insert-------------");
  console.log(insertTest);

  //R (read)
  let selectTest = await executeQuery("SELECT * FROM image");
  // let selectTest = await executeQuery("SELECT * FROM image WHERE image_index = 2");
  console.log("select-------------");
  console.log(selectTest);

  //U (update)
  let updateTest = await executeQuery("UPDATE list SET title = '노동 동요'");
  console.log("update-------------");
  console.log(updateTest);

  //D (delete)
  let deleteTest = await executeQuery("DELETE FROM user");
  // let deleteTest = await executeQuery("DELETE FROM user WHERE user_index = 1");
  console.log("delete-------------");
  console.log(deleteTest);

  res.render("index", { title: "Express" });
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
