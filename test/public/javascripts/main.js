// logout button 클릭
$(".logout").click(function () {
  $.ajax({
    url: "/logout",
    method: "post",
    success: function (result) {
      location.href = "/";
    },
  });
});

// comment button 클릭
$(".comment-button").click(function () {
  $.ajax({
    url: `/comment?idx=${$(this).attr("list-index")}`,
    method: "get",
    success: function (result) {
      console.log(result);
    },
  });
});
