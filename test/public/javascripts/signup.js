//문제가 있을 경우 알러트
if (result === "false") {
  alert(message);
}

//로그인 페이지로 이동
$("#login-page-button").click(function () {
  location.href = "/login";
});

//회원가입 로직 실행
function signupSubmit() {
  if ($("#id").val() === "") {
    alert("아이디가 비어있습니다.");
    return false;
  }

  if ($("#password").val() === "") {
    alert("비밀번호가 비어있습니다.");
    return false;
  }

  if ($("#name").val() === "") {
    alert("이름이 비어있습니다.");
    return false;
  }

  return true;
}
