var express = require("express");
var router = express.Router();
const mariadb = require("mariadb");

//mariadb 연결
let pool = mariadb.createPool({
  host: "127.0.0.1", //호스트 (로컬)
  database: "db-test", //데이터베이스 명
  port: "3306", //설치 때 지정한 포트
  user: "root", //아이디
  password: "123123", //패스워드
});

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC_FlbYm1QYmiz68EI1AXYaigmomcqwygc",
  authDomain: "test-9dc59.firebaseapp.com",
  projectId: "test-9dc59",
  storageBucket: "test-9dc59.appspot.com",
  messagingSenderId: "664644789191",
  appId: "1:664644789191:web:179572dcfdc441123d6fe2",
  measurementId: "G-QK810EY7TX",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

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
            console.log(">>>>>");
            // query 결과
            resolve(rows);
          })
          .catch((err) => {
            console.log(err);
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
  const auth = getAuth();
  let id = req.body.id;
  let password = req.body.password;
  let message;

  if (req.body.firebase === "on") {
    //로그인
    signInWithEmailAndPassword(auth, id, password)
      .then((userCredential) => {
        console.log("login success");
        // Signed in
        const user = userCredential.user;

        // session에 유저 정보 담기
        req.session.user = user;

        //main page로
        return res.redirect("/main");
      })
      .catch((error) => {
        console.log("login fail");
        const errorMessage = error.message;

        message = "?result=false&message=" + errorMessage;

        return res.redirect("/login" + message);
      });
  } else {
    //id 검색
    let selectId = await executeQuery(`
      SELECT 
        * 
      FROM 
        user 
      WHERE email = '${id}'
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
  }
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
  const auth = getAuth();
  let id = req.body.id;
  let password = req.body.password;
  let name = req.body.name;

  if (req.body.firebase === "on") {
    //회원가입
    createUserWithEmailAndPassword(auth, id, password)
      .then((userCredential) => {
        console.log("signup success");
        // Signed in
        const user = userCredential.user;

        //profile update
        updateProfile(user, {
          displayName: name,
        }).then(function () {
          console.log(user);
        });

        return res.redirect("/login");
      })
      .catch((error) => {
        console.log("signup fail");
        const errorMessage = error.message;

        return res.redirect("/signup?result=false&message=" + errorMessage);
      });
  } else {
    //id 검색
    let selectId = await executeQuery(`
        SELECT 
          * 
        FROM 
          user 
        WHERE email = '${id}'
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
  }
});

//메인 페이지 렌더링
router.get("/main", async function (req, res, next) {
  //session 이 없을 경우 로그인 페이지로 이동
  if (!req.session.user) {
    console.log("login 페이지로 이동");
    return res.redirect("/login");
  }

  //리스트 가져오기
  let lists = await executeQuery(`
    SELECT 
      l.list_index,
      l.title,
      l.contents,
      DATE_FORMAT(l.create_time, '%Y-%m-%d %H:%i:%s') AS create_time,
      u.email,
      u.name,
      u.profile,
      GROUP_CONCAT(i.image) AS image
    FROM
      list AS l
    LEFT JOIN user AS u ON l.user_index = u.user_index
    LEFT JOIN image AS i ON l.list_index = i.list_index
    GROUP BY l.list_index
    ORDER BY l.create_time DESC;
  `);

  return res.render("main", {
    user: req.session.user,
    list: lists,
  });
});

//session setting
router.post("/set-session", function (req, res, next) {
  let user = req.body.user;
  req.session.user = user;

  res.send(user);
});

//logout
router.post("/logout", function (req, res, next) {
  req.session.destroy();

  res.send("success");
});

//comment
router.get("/comment", async function (req, res, next) {
  //댓글 가져오기
  let comments = await executeQuery(`
    SELECT 
      *
    FROM
      comment
    WHERE
      list_index = ${req.query.idx}
  `);

  res.send(comments);
});
module.exports = router;
