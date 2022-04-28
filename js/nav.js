let userSession;
$(document).ready(() => {
  user = $("#variableJSON").text();
  $("#variableJSON").remove();
  if (userSession) {
    $(".nav-logged").show();
    $(".nav-inicio").hide();
    return;
  }
  $(".nav-logged").hide();
  $(".nav-inicio").show();
});
