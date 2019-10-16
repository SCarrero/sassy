function isElementInViewport(item) {
  var el = item[0];
  if (el.getBoundingClientRect) {
    var rect = el.getBoundingClientRect();
    return (
      rect.bottom >= 0 &&
      rect.right >= 0 &&
      rect.top <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.left <= (window.innerWidth || document.documentElement.clientWidth)
    );
  } else {
    return true;
  }
}
function animTrigger() {
  if (isElementInViewport($(".odometer1"))) {
    $(".odometer1").find(".odometer-number").children().addClass("odometer-animate");
  } else {
    $(".odometer1").find(".odometer-animate").removeClass("odometer-animate");
  }
  if (isElementInViewport($(".odometer2"))) {
    $(".odometer2").find(".odometer-number").children().addClass("odometer-animate");
  } else {
    $(".odometer2").find(".odometer-animate").removeClass("odometer-animate");
  }
}
function setUpAnim() {
  $(window).on("load scroll resize orientationchange", function() {
    var timerAnim = setTimeout(animTrigger, 1300);
  });
}
setUpAnim();
