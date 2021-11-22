var express = require("express");
var router = express.Router();
const mariadb = require("mariadb");

//mariadb 연결
let pool = mariadb.createPool({
  host: "127.0.0.1", //호스트 (로컬)
  database: "db-test", //데이터베이스 명
  port: "3308", //설치 때 지정한 포트
  user: "root", //아이디
  password: "123123", //패스워드
});

//sql 실행 함수
function executeQuery(query) {
  return new Promise(function (resolve) {
    pool
      //db 커넥션 확인
      .getConnection()
      //db 커넥션 잘 되있음.
      .then((conn) => {
        console.log(query);

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

//기본은 로그인 페이지로
router.get("/", async function (req, res, next) {
  console.log(req.session);
  return res.redirect("/login");
});

//로그인 페이지 렌더링
router.get("/login", function (req, res, next) {
  return res.render("login", {
    result: req.query.result,
    message: req.query.message,
  });
});

//로그인 로직
router.post("/login", async function (req, res, next) {
  let id = req.body.id;
  let password = req.body.password;
  let message;

  //id 검색
  let selectId = await executeQuery(`
    SELECT 
      * 
    FROM 
      user email = '${id}'
  `);

  //id가 없을 경우
  if (selectId.length === 0) {
    message = "?result=false&message=회원 목록에 없습니다.";
    return res.redirect("/login" + message);
  } else {
    //id가 있지만 password가 틀린경우
    if (selectId[0].password !== password) {
      message = "?result=false&message=비밀번호가 틀렸습니다.";
      return res.redirect("/login" + message);
    }
  }

  //main page로
  return res.redirect("/main");
});

//회원가입 페이지 렌더링
router.get("/signup", function (req, res, next) {
  return res.render("signup", {
    result: req.query.result,
    message: req.query.message,
  });
});

//회원가입 로직
router.post("/signup", async function (req, res, next) {
  let id = req.body.id;
  let password = req.body.password;
  let name = req.body.name;

  //id 검색
  let selectId = await executeQuery(`
    SELECT 
      * 
    FROM 
      user email = '${id}'
  `);

  //id가 없을 경우
  if (selectId.length === 0) {
    // 회원 추가
    await executeQuery(`
      INSERT INTO 
        user 
          (email, password, name) 
        VALUE 
          ('${id}', '${password}', '${name}');
    `);

    //로그인 페이지로 되돌아가기
    return res.redirect("/login");
  } else {
    return res.redirect("/signup?result=false&message=아이디가 중복됩니다.");
  }
});

//메인 페이지 렌더링
router.get("/main", function (req, res, next) {
  return res.render("main", {});
});

module.exports = router;
