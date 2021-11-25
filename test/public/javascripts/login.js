//문제가 있을 경우 알러트
if (result === "false") {
  alert(message);
}

//회원가입 버튼 클릭
$("#signup-button").click(function () {
  location.href = "/signup";
});

//로그인 로직 실행
function loginSubmit() {
  if ($("#id").val() === "") {
    alert("아이디가 비어있습니다.");
    return false;
  }

  if ($("#password").val() === "") {
    alert("비밀번호가 비어있습니다.");
    return false;
  }

  return true;
}

$("#google-login").click(function () {
  firebase
    .auth()
    .signInWithPopup(provider)
    .then((result) => {
      const user = result.user;

      $.ajax({
        url: "/set-session",
        method: "post",
        data: {
          user: user.providerData[0],
        },
        success: function (result) {
          location.href = "/main";
        },
      });
    })
    .catch((error) => {});
});
