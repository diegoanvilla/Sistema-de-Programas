function checkElementLocation() {
  var bottomWindown = $(window).scrollTop() + $(window).height();
  $(".fade-custom").each(function (i) {
    var $that = $(this);
    var bottomObject = $that.offset().top + 100;
    if (bottomWindown > bottomObject) {
      $(this).addClass("fade-in");
      $(this).removeClass("fade-custom");
    }
  });
}
$("*").on("scroll", function () {
  checkElementLocation();
});
checkElementLocation();
