// Init controller
var controller = new ScrollMagic.Controller({
  globalSceneOptions: {
    triggerHook: "onLeave",
    reverse: true
  }
}),
 addFocus = function(hash){
  $(hash).focus(); 
  if ($(hash).is(":focus")){
    return false;
  } 
  else {
    $(hash).attr('tabindex','-1'); 
    $(hash).focus(); 
  };
 }

// Change behaviour of controller
// to animate scroll instead of jump
controller.scrollTo(function(target, hash) {
  TweenMax.to(window, 0.5, {
    scrollTo : {
      y : target,
      autoKill : true
    },
    ease : Cubic.easeInOut,
    onComplete: function() { addFocus(hash); }
  });
});
 

$('a[href^="#"]:not([href="#"])').on("click", function(e) {
  var target = e.target,
    hash = target.getAttribute('href');
  if($(hash).length > 0) {
    e.preventDefault();
    controller.scrollTo(hash, hash);
    // if supported by the browser we can even update the URL.
    if (window.history && window.history.pushState) {
      history.pushState("", document.title, hash);
    }
  }
});

