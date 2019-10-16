 //begin
var FM=FM || {},
QueryParam={},
captchaonloadCallback = function(){
  if($("#form-submit").attr('disabled')){
  }
  else{
    $("#form-submit").attr("disabled","disabled");
    grecaptcha.reset();
  }
  grecaptcha.render('recaptcha', {
    'sitekey' : '6LemIFwUAAAAAFGv',
    'callback' : checkResponse,
    'expired-callback' : captchaonloadCallback
  });
},
checkResponse = function(response){
  var path = location.pathname.match(/\/loanlookup/) ? "/loanlookup" : "";
  $.post(path+"/cgi-bin/captcha/captcha.cgi" , { token: response }, function( data ) {
    if(data.success){
      $("#form-submit").removeAttr('disabled');
    }
    else{
      alert("Validation failed, please try again!");
    }
  }, "json");
};
FM.form = {  						
  domain : 'http://www.freddiemac.com',	
  protocol : location.protocol, 			// returns http:
  hostname : location.hostname, 			// returns www.fm.com no port)
  pathname : location.pathname, 			// returns /test/test.htm
  pathElements: location.pathname.replace(/^\//,'').split("/"),   // returns array of path sections 
  hash : location.hash, 					// returns #part2 
  href : location.href, 					// returns http://www.fm.com/test.htm#part2
  querystr : location.search, 			// returns ?f=try&g=it if URL is: http://fm.com/js/aa.cgi?f=try&g=it
  referrer:  document.referrer,          // returns referring page, if available
  fmTimer:0,
  QueryPairs : location.search.replace(/^\?/,'').split(/\&/),
  setCookie: function (a,b,c,d){b||(b="");if(!c||isNaN(c))c=.5;d||(d="/");var e=new Date;e.setTime(e.getTime()+c*24*60*60*1e3),e=e.toGMTString(),a&&(document.cookie=a+"="+b+";expires="+e+";path="+d)},
  getCookie:	function (a){var b=new RegExp(a+"=[^;]+","i");return a&&document.cookie.match(b)?document.cookie.match(b)[0].split("=")[1]:""},
  deleteCookie: function (a,b){b||(b="/"),FM.form.getCookie(a)!==""&&FM.form.setCookie(a,"","-1",b)},
  limitText: function(a,b,m) {var v=$(a).val(),l=v.length,n=m-l,r=n==1?n+' char':n+' chars'; if(l>m){$(a).val(v.substring(0,m));}else {$(b).html(r);}},
  trimWhiteSpace: function(v){v = v.replace(/^\s+/,'');v = v.replace(/\s+$/,'');return v.replace(/\s{2,}/g,' ');},
  forceGlobalLinks :  function (a){var b=(FM.form.domain+a).replace(/(\/slearnctr|\/loanlookup)(uat)?/,"");return b},
  useOmni: false,
  toggleClick:function(){var f=arguments;return this.each(function(){var it=0;$(this).on("click",function(){f[it].apply(this, arguments);it=(it+1) % f.length;});})},
  setTimer: function(routine,delay) { if(routine && delay>0){ clearTimeout(FM.form.fmTimer); FM.form.fmTimer = setTimeout(routine, delay);}},
  resetReveal: function(){if ($('.reveal:visible').length === 0) {$('.is-reveal-open').removeClass('is-reveal-open');}},
  offsetReveal: function(){var rev = $(".reveal[aria-hidden='false']").filter('.full');  if(rev.length){ rev.css('top', 0);}},
  cta: function(a,b){if(typeof dataLayer != 'undefined'){a||(a="");b||(b="");dataLayer.push({'event':'ctaClick','ctaType':a,'parentComponentName':b});}}
};
for (var x in FM.form.QueryPairs) {
  QueryParam[decodeURIComponent(FM.form.QueryPairs[x].split('=')[0] || "")] = decodeURIComponent(FM.form.QueryPairs[x].split('=')[1] || "");
};

$("input[type='text'],input[type='search'],input[type='email']").on('change',function(){var v = $(this).val();$(this).val(FM.form.trimWhiteSpace(v));});
// process offsite
$('[href]').filter('.offsite, [rel="external"]').each(function(){
  var x = $(this)[0].hasAttribute('rel') ? $(this).attr('rel') : '',  y = x!=='' ? 'noopener noreferrer '+x : 'noopener noreferrer';	
  $(this).attr('target','_blank').attr('rel',y); 
  
});
// fix https relative urls
if(FM.form.protocol === 'https:') {		
  $('#header-nav,.footer').find('a[href^="/"]').each(function(){
	  $(this).attr('href', FM.form.forceGlobalLinks($(this).attr('href')));
  });	
  $('form[action="/loanlookup/search/"]').attr('action', "http://www.freddiemac.com/search/");
  $('#breadcrumb-wrapper').find('a').eq(0).each(function(){
	  if ($(this).text().match(/home/i)) $(this).attr('href', FM.form.domain);
  });	
};
// process file markers
if (FM.form.pathElements[0] !== "search") { 
	$(".iw_section:gt(0)").find("a[href]").not('.plain').not(":has(img)").not(":has(.callout)").not(":has(.card)").not(function(){
    return (/.+\.(html?|#|javascript)(\?.*)?(#.*)?$/i).test($(this).attr('href'));
  }).filter(function(){
    return (/.+\.(pdf|zip|csv|doc|xls|ppt)[mx]?(\?.*)?(#.*)?$/i).test($(this).attr('href'));
  }).each(function(){ 
    var h=$(this).attr('href').toLowerCase().replace(/.+\.(pdf|zip|csv|doc|xls|ppt)[mx]?(\?.*)?(#.*)?$/, "$1"); 
    if ($(this).is('.button')&& h.length) { $(this).append(" <span class='icon-file'>"+h+"</span>") }     
    else if($(this).closest('.data-filterable').length==0) { $(this).append(" <span class='icon-file'>"+h+"</span>"); }
  });
} 

$(function(){  
 // fix for full reveals not restoring scrollbar on close, may not be needed if fixed by Zurb. Animation takes 250ms
  $(window).on('closed.zf.reveal', function() {
      FM.form.resetReveal;
      FM.form.setTimer = setTimeout(FM.form.resetReveal, 400);
  }).on('open.zf.reveal', function() { 
      FM.form.setTimer = setTimeout(FM.form.offsetReveal, 350);  
  }).on('resizeme.zf.trigger', function() { 
      FM.form.setTimer = setTimeout(FM.form.offsetReveal, 300);  
  }).on('change.zf.tabs', function() { $(window).trigger('resize'); });
});

// corproate nav routines
// both primary and subnav for now -- may break apart ir needed

// add highlighting to parent link in desktop nav (not dependant on ready event.)
$('#desktop-corporate-home').addClass('active');

// routine to display the subnav on hover
function navHoverOff(){
  $('.nav-main').find('.current-hover').removeClass('current-hover');
}

// mobile toggles
var $toggles = $('#subnav-perspectives-toggle, #subnav-research-toggle, #subnav-blog-toggle, #subnav-mediaroom-toggle, #subnav-about-toggle');
$toggles.each(function(){  
  $(this).on("click", function(){
    if (!Foundation.MediaQuery.atLeast('xlarge')) {
      var parentID = $(this).parent('li').attr('id');
      $('.subnav-item').not('#'+parentID).each(function(){ 
        if($(this).attr('aria-expanded') === "true"){   
          $(this).find('.mobile-nav-accordion-parent').triggerHandler('click');
        }
      });
    }
  })
});
 
$('#nav-perspectives, #nav-research, #nav-blog, #nav-mediaroom, #nav-about, #subnav-perspectives, #subnav-research, #subnav-blog, #subnav-mediaroom, #subnav-about').each(function(){  
  $(this).mouseenter(function(){
    if (Foundation.MediaQuery.atLeast('xlarge')) {
      var i = $(this).attr('id').replace(/^(sub)?nav/,"section"); 
      if($('#'+i).length){
        $('#'+i).not('.active').addClass('current-hover');
      }
    }
    }).mouseleave(function(){ navHoverOff();})
});

$(".ribbon-rbo-section").on("mouseleave", function(){ 
    var $t = $(".ribbon-rbo-toggle"); 
    if($t.attr('aria-expanded') === "true"){
      $t.find('a').blur().triggerHandler('click');
    }
 });
$(".nav-bus-section").on("mouseleave", function(){ 
    var $t = $(".nav-bus-toggle"); 
    if($t.attr('aria-expanded') === "true"){
      $t.find('a').blur().triggerHandler('click'); 
    }
}); 

$(window).on('changed.zf.mediaquery', function(e, nS, oS){
  if((nS==="xlarge" || nS==="xxlarge")  && (oS==="small" || oS==="medium" || oS==="large")){
    if($('#nav-search').length && $('#nav-search').css('display') !== 'none') {
      $("#nav-search").foundation('toggle');
    }
    $('.is-accordion-submenu-parent[aria-expanded="true"]').each(  
      function(){ 
        $.fx.off = true;   
        $(this).closest('[data-accordion-menu]').foundation('hideAll');
        $.fx.off = false;
      }
    );
    if ($('#body-wrapper').hasClass('is-mobile-expanded')) {
      $.fx.off = true; 
      $('#nav-main').foundation('toggle');
      $("#body-wrapper").foundation('toggle');
      $.fx.off = false; 
    }
  } 
  else if((oS==="xlarge" || oS==="xxlarge") && (nS==="small" || nS==="medium" || nS==="large")){
    navHoverOff(); 
  }
});

$(function(){  
  $("#nav-search").on('on.zf.toggler', function(){ 
    if (!Foundation.MediaQuery.atLeast('xlarge')) {  
      $("#mobile-search").focus();
    }
    if ($('#nav-main').is(':visible')) {
      $('#nav-main').foundation('toggle');
    }
    if ($('#body-wrapper').hasClass('is-mobile-expanded')) {
      $("#body-wrapper").foundation('toggle');
    }
  });
  $("#nav-search").on('off.zf.toggler', function(){ 
    $("#mobile-search").val('');  
  });
  $("#nav-main").on('on.zf.toggler', function(){ 
    if($('#nav-search').length && $('#nav-search').css('display') !== 'none') {
      $("#nav-search").foundation('toggle');
    }
  });
  $("#nav-main").on('off.zf.toggler', function(){ 
    if ($('#body-wrapper').hasClass('is-mobile-expanded')) {
      $("#body-wrapper").foundation('toggle');
    }
  });
});
var adjustSideBar = {
	init: function() {  
    var $side = $('.iw_columns').filter('.large-5:first'),
    hero = $('.hero-blended:first').outerHeight() || 0,
    cntPdg = Foundation.MediaQuery.atLeast('xlarge') ? 58 : Foundation.MediaQuery.atLeast('large') ? 32 : 0,
    sdBar = $side.find('.sidebar:first').outerHeight(true);        
		if( Foundation.MediaQuery.atLeast('large') ) {     
      if(sdBar < hero) { $side.css('margin-top', -(sdBar+cntPdg)); }
      else if (hero > 0) { $side.css('margin-top', -(hero/2 +cntPdg)); }
			else { $side.css('margin-top', -50); }
		} 
    else {
			$side.removeAttr('style');
		}
	}
};

$(function(){
  if ($('.blog-detail-hero').length || $('.perspectives-detail-hero').length) {
    adjustSideBar.init();
    $(window).on('changed.zf.mediaquery', function() {
      adjustSideBar.init();
    });     
  }
});


function closestBlockParent(item) {
  $(item).parents().each(function(){
    if ($(this).css('display') == 'block') {
        return $(this);
    }
  });  
}

//  prep content for modals by adding buttons
function preReveal() {
  $(".reveal[id][data-reveal]").not('.overlay-video').each(function(){
    var  obj = $(this), 
    i = obj.attr('id'),
    svgClose = '<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 167.39 167.39"><path fill="#fff" d="M83.7 0a83.7 83.7 0 1 0 83.7 83.7A83.7 83.7 0 0 0 83.7 0zm42.67 127.06a6.13 6.13 0 0 1-8.67-.07l-34-34.55L49.69 127a6.13 6.13 0 1 1-8.74-8.6L75.1 83.7 41 49a6.13 6.13 0 1 1 8.74-8.6L83.7 75l34-34.55a6.13 6.13 0 1 1 8.74 8.6L92.29 83.7l34.14 34.69a6.13 6.13 0 0 1-.06 8.67z"/></svg>',    
    btnClose = $("<button />",{
    "class": "close-button",
    "aria-label": "Close modal",
    "data-close": "",
    "type": "button",
    "html": "<span aria-hidden='true'>"+svgClose+"</span>"
    });
    if($(this).filter('.overlay-image, .overlay-gallery').length){  
      obj.find('img:first').after(btnClose); 
      $('a[data-open="'+i+'"][href]').on("click",function(e){ e.preventDefault(); }); 
      obj.find('.modal-content').on("click",function(){ obj.foundation('close'); });
    }
    else {
      obj.find('.modal-header:first').append(btnClose);
    }
    obj.not('.overlay-gallery').attr('data-animation-in', "scale-in-up").attr('data-animation-out', "scale-out-down").addClass('fast');
  }); 
}

function preRevealGallery() {
  var galleryRel = [];
  $(".reveal[id][data-reveal]").filter('.overlay-gallery[rel]').each(function(){
    var rel=$(this).attr('rel');
    if ($.inArray(rel,galleryRel) < 0){galleryRel.push(rel);}
  });
  while (galleryRel.length > 0) {
    var $r = galleryRel.shift(), galleryCount = $(".reveal[id][data-reveal]").filter("[rel=" + $r + "]").length;
    $(".reveal[id][data-reveal]").filter("[rel=" + $r + "]").each(function(x){ 
      var  obj = $(this), 
      prevItem = (x == 0) ? (galleryCount - 1) : (x - 1),
      nextItem = (x == galleryCount - 1) ? 0 : (x + 1),
      prevID = $("[rel=" + $r + "]").eq(prevItem).attr('id'),
      nextID = $("[rel=" + $r + "]").eq(nextItem).attr('id'),
      btnPrev = $("<button />",{
        "class": "orbit-previous",
        "data-open": prevID,
        "type": "button",
        "html": '<span class="show-for-sr">previous slide</span><svg aria-hidden="true" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="14 14 22 22"><path d="M27.3 34.7L17.6 25l9.7-9.7 1.4 1.4-8.3 8.3 8.3 8.3z"/></svg>'
      }),
      btnNext = $("<button />",{
        "class": "orbit-next",
        "data-open": nextID,
        "type": "button",
        "html": '<span class="show-for-sr">next slide</span><svg aria-hidden="true" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="14 14 22 22"><path d="M22.7 34.7l-1.4-1.4 8.3-8.3-8.3-8.3 1.4-1.4 9.7 9.7z"/></svg>'
      });
      obj.find('figure').append(btnNext, btnPrev);
      obj.attr('data-animation-in', "fade-in").attr('data-animation-out', "fade-out").addClass('fast');
    });
  }   
}
function preRevealVideo() {  
  var w = window.innerWidth|| document.documentElement.clientWidth|| document.body.clientWidth; 
  if (w <= 450) { return; }
  var svgClose = '<svg class="slow" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 167.39 167.39"><path fill="#fff" d="M83.7 0a83.7 83.7 0 1 0 83.7 83.7A83.7 83.7 0 0 0 83.7 0zm42.67 127.06a6.13 6.13 0 0 1-8.67-.07l-34-34.55L49.69 127a6.13 6.13 0 1 1-8.74-8.6L75.1 83.7 41 49a6.13 6.13 0 1 1 8.74-8.6L83.7 75l34-34.55a6.13 6.13 0 1 1 8.74 8.6L92.29 83.7l34.14 34.69a6.13 6.13 0 0 1-.06 8.67z"/></svg>',    
    btnClose = '<button class="close-button" aria-label="Close modal" data-close type="button"><span aria-hidden="true">'+svgClose+'</span></button>',
    frameAttributes = 'frameborder="0" allowfullscreen allowscriptaccess="always" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"',
    $frameWide = '<iframe id="frameWideYT" src="" '+frameAttributes+'></iframe>',
    $frameStandard = '<iframe id="frameStandardYT" src="" '+frameAttributes+'></iframe>',
    modalWide = $("<div />",{
      "class": "reveal overlay-video fast",
      "data-reveal": "",
      "data-reset-on-close": true,
      "data-deep-link": false,
      "id": "videoWideYT",
      "data-animation-in" : "scale-in-down",
      "data-animation-out" : "scale-out-up",
      "html": btnClose + '<div class="responsive-embed widescreen">'+$frameWide+'</div>'
    }),
    modalStandard = $("<div />",{
      "class": "reveal overlay-video",
      "data-reveal": "",
      "data-reset-on-close": true,
      "data-deep-link": false,
      "id": "videoStandardYT",
      "data-animation-in" : "scale-in-down",
      "data-animation-out" : "scale-out-up",
      "html": btnClose + '<div class="responsive-embed">'+$frameStandard+'</div>'
    });
  if($(".video-modal[data-src]").filter('.widescreen-video').length){
    $('body').prepend(modalWide); 
    $('#videoWideYT').on('closed.zf.reveal', function(){
      $('#frameWideYT').replaceWith($frameWide);
    });
  }
  if($(".video-modal[data-src]").length > $(".video-modal[data-src]").filter('.widescreen-video').length){  
    $('body').prepend(modalStandard); 
    $('#videoStandardYT').on('closed.zf.reveal', function(){
      $('#frameStandardYT').replaceWith($frameStandard);
    });
  }
  $(".video-modal[data-src]").each(function(x){    
    var $lnk = $(this),
      $src = $lnk.attr('data-src'),
      targetId = $lnk.hasClass('widescreen-video') ?  'videoWideYT' : 'videoStandardYT';
    $lnk.attr('data-open', targetId).attr('aria-controls', targetId);         
    $lnk.on("click",function(e){ 
      w = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth; 
      if (w > 450) { 
        e.preventDefault(); 
      }
      if($lnk.hasClass('widescreen-video')) {
        $('#frameWideYT').attr('src', $src+'&autoplay=1&enablejsapi=1');
        $('#frameWideYT').on("click",function(){
          $(this).foundation('close');
        });
      }
      else {
        $('#frameStandardYT').attr('src',$src+'&autoplay=1&enablejsapi=1');
        $('#videoStandardYT').foundation('open').on("click",function(){
          $(this).foundation('close');
        });
      }     
    }); 
      
  });
} 
if($(".reveal").length){ 
  preReveal();
}
if($(".overlay-gallery").length){
  preRevealGallery();
}
if($(".video-modal").length) { 
  preRevealVideo();
}

 

// prep content for Rotators using Orbit
//automate insertion of Close Buttons and active item highlighting
function orbBulletMarkup(container, slClass){
  var orbBullets = '';
  container.find('.'+slClass).each(function(i){    
    orbBullets += '<button type="button" data-slide="' + i + '"><span class="show-for-sr">slide '+ (i+1) + '</span></button>';  
  }); 
  return orbBullets;
}
// my attempt to duplicate the height logic and reset it as needed
function recalcOrbit() {
  $('.orbit').each(function(x) {
    var max = 0, temp, counter = 0, 
    orb = $(this),    
    slideClass = orb.attr('data-slide-class') || "orbit-slide",
    orbContainerClass = orb.attr('data-container-class') || "orbit-container",
    $wrapper = orb.find('.'+orbContainerClass),
    $slides = orb.find('.'+slideClass);
    $wrapper.css({'height': 'auto'}); 
    $slides.each(function() {
      temp = this.getBoundingClientRect().height;
      $(this).attr('data-slide', counter);
      if ($slides.filter('.is-active')[0] !== $slides.eq(counter)[0]) {
        $(this).css({'position': 'relative', 'display': 'none'});
      }
      max = temp > max ? temp : max;
      counter++;
    });
    if (counter === $slides.length) {
      $wrapper.css({'height': max}); 
    }
  })  
}

function preOrbit() {  
  $('.orbit').each(function(x) {
    var orb = $(this), 
    useBullets = orb.attr('data-bullets') || "true",
    useButtons = orb.attr('data-nav-buttons') || "true", 
    buttonParentClass = orb.attr('data-nav-parent-class') || 'orbit';
    bulletBox = orb.attr('data-box-of-bullets') || "orbit-bullets",
    slideClass = orb.attr('data-slide-class') || "orbit-slide",
    orbContainerClass = orb.attr('data-container-class') || "orbit-container",
    nextBtnClass = orb.attr('data-next-class') ? "orbit-next " + orb.attr('data-next-class') : "orbit-next",
    prevBtnClass = orb.attr('data-prev-class') ? "orbit-previous " + orb.attr('data-prev-class') : "orbit-previous",
    orbContainer = orb.find('.'+orbContainerClass+':first'),
    orbSlides = orbContainer.children('.'+slideClass),
    useOverlay = orb.hasClass('bullets-overlay'),
    activeSlide = 0,
    automateNav = orb.attr('data-automate-nav') || "true",
    btnPrev = $("<button />",{
      "class": prevBtnClass,
      "type": 'button',
      "html": '<span class="show-for-sr">previous slide</span><svg aria-hidden="true" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M213.7,256L213.7,256L213.7,256L380.9,81.9c4.2-4.3,4.1-11.4-0.2-15.8l-29.9-30.6c-4.3-4.4-11.3-4.5-15.5-0.2L131.1,247.9	c-2.2,2.2-3.2,5.2-3,8.1c-0.1,3,0.9,5.9,3,8.1l204.2,212.7c4.2,4.3,11.2,4.2,15.5-0.2l29.9-30.6c4.3-4.4,4.4-11.5,0.2-15.8 L213.7,256z"/></svg>'
    }),
    btnNext = $("<button />",{
      "class": nextBtnClass,
      "type": 'button',
      "html": '<span class="show-for-sr">next slide</span><svg aria-hidden="true" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M298.3,256L298.3,256L298.3,256L131.1,81.9c-4.2-4.3-4.1-11.4,0.2-15.8l29.9-30.6c4.3-4.4,11.3-4.5,15.5-0.2l204.2,212.7 c2.2,2.2,3.2,5.2,3,8.1c0.1,3-0.9,5.9-3,8.1L176.7,476.8c-4.2,4.3-11.2,4.2-15.5-0.2L131.3,446c-4.3-4.4-4.4-11.5-0.2-15.8 L298.3,256z"/></svg>'
    }),
    orbControls = $("<div />", { "class": "orbit-controls" }),    
    orbBulletContainer = $("<nav />", {
      "class": bulletBox + " orbit-bullets",
      "html" : orbBulletMarkup(orbContainer, slideClass)
    });    
    if (orbSlides.length<1){ 
      return;
    }    
    if (automateNav=="true"){      
      if (useOverlay || useButtons=="true" || useBullets=="true"){
        if(buttonParentClass=='orbit'){
          orb.append(orbControls);
        }
        else if(orb.find('.'+buttonParentClass).length>0){
          orb.find('.'+buttonParentClass+':first').append(orbControls);
        }
      }
      if (useBullets=="true") {   
        if(useOverlay && orb.find('.orbit-controls').length){
          orb.find('.orbit-controls').eq(0).append(orbBulletContainer);
        }
        else {
          orb.append(orbBulletContainer);
        }
      }
      if(useButtons=="true") { 
        orb.find('.orbit-controls').eq(0).prepend(btnPrev).append(btnNext);      
      }
    }
    if (orbSlides.filter('.is-active').length<1){ 
        orbSlides.eq(0).addClass('is-active');
    }
    activeSlide = orbSlides.filter('.is-active').index();
    orb.find('.orbit-bullets').children('button').eq(activeSlide).addClass('is-active');
  });
}

if($(".orbit").length){ 
  preOrbit();
  var orbitTimer=0;
  $(window).on('resize', function() {   
    clearTimeout(orbitTimer);
    orbitTimer = setTimeout(recalcOrbit, 300);  
  });  
}


// highlight and collapse nav tertiary sections

function tertiaryNav(){
  var $navList = $('.tertiary-nav').find('ul:first') || '',
  $navLinks = $navList.find('a'),
  p = location.pathname.match(/\/$/) ? location.pathname + "index." : location.pathname, 
  h='';
  $navList.find('ul').addClass('hide');
  $navLinks.each(function(){
    h = $(this).attr('href').match(/\/$/) ? $(this).attr('href') + "index." : $(this).attr('href');
    if(h !== p) { return; }
    $(this).addClass('active').parents('li').addClass('parent');  
    $(this).closest('ul.hide').removeClass('hide').parent('li').addClass('data-expanded');
    if($(this).siblings('ul').length) {       
      $(this).siblings('ul').removeClass('hide');
      $(this).closest('li').addClass('data-expanded'); 
    }
  });
}

if ($(".tertiary-nav").length) {tertiaryNav();}

function getWidth(){
  var w = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth; 
  return w;
} 
Foundation.Accordion.defaults.multiExpand = true;
Foundation.Accordion.defaults.allowAllClosed = true;
//Foundation.Accordion.defaults.deepLink = true;
//Foundation.Accordion.defaults.updateHistory = true;
//Foundation.Accordion.defaults.deepLinkSmudge = true;
Foundation.Reveal.defaults.deepLink = true;
Foundation.Reveal.defaults.fullScreen = false;
Foundation.Reveal.defaults.resetOnClose = true;
Foundation.Reveal.defaults.updateHistory = true;
Foundation.Reveal.defaults.vOffset = 0;
// Reveal closeOnEsc and closeOnClick are both true 
// disabling deeplink and update history to prevent bug where other bookmarks in url disable all active tabs
//Foundation.Tabs.defaults.deepLink = true;
//Foundation.Tabs.defaults.updateHistory = true;
//Foundation.Tabs.defaults.deepLinkSmudge = true; 
if (getWidth() > 569) { 
  Foundation.Tabs.defaults.matchHeight = true;
}
Foundation.Abide.defaults.patterns['digits_dashes'] = /^[0-9-]*$/;
Foundation.Abide.defaults.patterns['digits_slashes'] = /^[0-9\/]*$/;
Foundation.Abide.defaults.patterns['YYslashMM'] = /^\d{2}\/(0[1-9]|1[0-2])$/;
Foundation.Abide.defaults.patterns['tel'] = /^\(?\d{3}\)?[\s+|-]?\d{3}[\s+|-]?\d{4}/;
Foundation.Abide.defaults.patterns['ssn'] = /^[0-9]{4}$/;
Foundation.Abide.defaults.patterns['alpha-num-hyphen'] = /^[-A-Za-z0-9 ]+$/;
Foundation.Abide.defaults.patterns['no-unsafe'] = /^[^\[\]{}<>#%^*_+=|\\/~`]+$/;
Foundation.Abide.defaults['validators']['checked_required'] =
  function ($el, required, parent) {
    var group = parent.closest('.checked-group');
    var min = group.attr('data-validator-abide-min') || 1;
    var max = group.attr('data-validator-abide-max') || 9999;
    var checked = group.find(':checked').length;
    if (checked >= min  && checked <= max) {
      group.find('label').filter('.is-invalid-label').removeClass('is-invalid-label');
      group.find('[data-abide-error]').hide();   
      return true;
    } else {
      group.find('label').each(function() { $(this).addClass('is-invalid-label'); });
      group.find('[data-abide-error]').css({ display: 'block' });
      group.find('[data-validator="checked_required"]').siblings('label').addBack().on('click', function(){ 
        group.find('[data-abide-error]').hide().end().find('label').filter('.is-invalid-label').removeClass('is-invalid-label');
      });
      return false;
    }
  };

$(document).foundation(); 

var shareLinkDecode = function(value){
    return $("<div/>").html(value).text();
  },
  shareLinkUpdate1 = function(){
  var winProps = 'channelmode=no,directories=no,fullscreen=no,location=no,status=no,toolbar=no,modal=yes,alwaysRaised=yes,resizable=yes',
      lnk = encodeURIComponent(location),
      dtlnk =  $('.sharelink-twitter').length && $('.sharelink-twitter')[0].hasAttribute('data-location') ? $('.sharelink-twitter').attr('data-location') : lnk,
      title1= $('meta[property="og:title"]').length && $('meta[property="og:title"]:first').attr('content').length ? $('meta[property="og:title"]:first').attr('content') : $('h1:first').text().length ? $('h1:first').text() : document.title.length ? document.title : '',
      title = encodeURIComponent(shareLinkDecode(title1)),
      img = $('meta[property="og:image"]').length && $('meta[property="og:image"]:first').attr('content').length ? $('meta[property="og:image"]:first').attr('content') : '',
      sum1 = $('meta[property="og:description"]').length && $('meta[property="og:description"]:first').attr('content').length ? shareLinkDecode($('meta[property="og:description"]:first').attr('content')) : '',
      sum2 = $('meta[name="abstract"]').length && $('meta[name="abstract"]:first').attr('content').length ? shareLinkDecode($('meta[name="abstract"]:first').attr('content')) : '',
      summary = sum1.length > 5 ? encodeURIComponent(sum1) : sum2.length > 5 ? encodeURIComponent(sum2) : '',
      fblink = 'https://www.facebook.com/sharer/sharer.php?u='+lnk,
      lilink = 'https://www.linkedin.com/shareArticle?mini=true&url='+lnk+'&title='+title+'&source='+lnk+'&summary='+summary,
      mtlink = 'mailto:?body=You%20might%20be%20interested%20in%20this%20article%20by%20Freddie%20Mac.%20'+title+':%20'+summary+'%20'+lnk+'&Subject='+title,
      twlink = 'https://twitter.com/intent/tweet/?text='+title+'&url='+dtlnk+'&via=freddiemac';

  $('.sharelink-mailto').each(function(){
    $(this).attr('href',mtlink); 
  });
  $('.sharelink-facebook').each(function(){ 
    $(this).attr('href', 'javascript:void(0);').on('click', function(e){ 
      var sharer_modal = window.open(fblink, "_blank", winProps + ',width=600,height=500', true); 
      sharer_modal.opener=null;
    });	
  });
  $('.sharelink-linkedin').each(function(){ 
    $(this).attr('href', 'javascript:void(0);').on('click', function(e){  
      var sharer_modal = window.open(lilink, "_blank", winProps + ',width=800,height=600', true); 
      sharer_modal.opener=null;
    });	
  });
  $('.sharelink-twitter').each(function(){ 
    $(this).attr('href', 'javascript:void(0);').on('click', function(e){ 
      var sharer_modal = window.open(twlink, "_blank", winProps + ',width=500,height=500', true); 
      sharer_modal.opener=null;
    });
  });	
};

$(function(){  
  $(".share-wrapper").filter('.hide').each(function(){
    $(".share-wrapper").removeClass('hide');
  });
  if($(".share-widget").length){ shareLinkUpdate1(); }
});

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZtR2xvYmFscy5qcyIsImhlYWRlck5hdl9jb3JwLmpzIiwiYWRqdXN0U2lkZWJhci5qcyIsInByZXBNb2RhbHMuanMiLCJwcmVwUm90YXRvcnMuanMiLCJ0ZXJ0aWFyeU5hdi5qcyIsImFwcENvcnAuanMiLCJzaGFyZVdpZGdldC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDakdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbkdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzdJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3pHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2xEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiYXBwX2NvcnAuanMiLCJzb3VyY2VzQ29udGVudCI6WyIgLy9iZWdpblxudmFyIEZNPUZNIHx8IHt9LFxuUXVlcnlQYXJhbT17fSxcbmNhcHRjaGFvbmxvYWRDYWxsYmFjayA9IGZ1bmN0aW9uKCl7XG4gIGlmKCQoXCIjZm9ybS1zdWJtaXRcIikuYXR0cignZGlzYWJsZWQnKSl7XG4gIH1cbiAgZWxzZXtcbiAgICAkKFwiI2Zvcm0tc3VibWl0XCIpLmF0dHIoXCJkaXNhYmxlZFwiLFwiZGlzYWJsZWRcIik7XG4gICAgZ3JlY2FwdGNoYS5yZXNldCgpO1xuICB9XG4gIGdyZWNhcHRjaGEucmVuZGVyKCdyZWNhcHRjaGEnLCB7XG4gICAgJ3NpdGVrZXknIDogJzZMZW1JRndVQUFBQUFGR3YnLFxuICAgICdjYWxsYmFjaycgOiBjaGVja1Jlc3BvbnNlLFxuICAgICdleHBpcmVkLWNhbGxiYWNrJyA6IGNhcHRjaGFvbmxvYWRDYWxsYmFja1xuICB9KTtcbn0sXG5jaGVja1Jlc3BvbnNlID0gZnVuY3Rpb24ocmVzcG9uc2Upe1xuICB2YXIgcGF0aCA9IGxvY2F0aW9uLnBhdGhuYW1lLm1hdGNoKC9cXC9sb2FubG9va3VwLykgPyBcIi9sb2FubG9va3VwXCIgOiBcIlwiO1xuICAkLnBvc3QocGF0aCtcIi9jZ2ktYmluL2NhcHRjaGEvY2FwdGNoYS5jZ2lcIiAsIHsgdG9rZW46IHJlc3BvbnNlIH0sIGZ1bmN0aW9uKCBkYXRhICkge1xuICAgIGlmKGRhdGEuc3VjY2Vzcyl7XG4gICAgICAkKFwiI2Zvcm0tc3VibWl0XCIpLnJlbW92ZUF0dHIoJ2Rpc2FibGVkJyk7XG4gICAgfVxuICAgIGVsc2V7XG4gICAgICBhbGVydChcIlZhbGlkYXRpb24gZmFpbGVkLCBwbGVhc2UgdHJ5IGFnYWluIVwiKTtcbiAgICB9XG4gIH0sIFwianNvblwiKTtcbn07XG5GTS5mb3JtID0geyAgXHRcdFx0XHRcdFx0XG4gIGRvbWFpbiA6ICdodHRwOi8vd3d3LmZyZWRkaWVtYWMuY29tJyxcdFxuICBwcm90b2NvbCA6IGxvY2F0aW9uLnByb3RvY29sLCBcdFx0XHQvLyByZXR1cm5zIGh0dHA6XG4gIGhvc3RuYW1lIDogbG9jYXRpb24uaG9zdG5hbWUsIFx0XHRcdC8vIHJldHVybnMgd3d3LmZtLmNvbSBubyBwb3J0KVxuICBwYXRobmFtZSA6IGxvY2F0aW9uLnBhdGhuYW1lLCBcdFx0XHQvLyByZXR1cm5zIC90ZXN0L3Rlc3QuaHRtXG4gIHBhdGhFbGVtZW50czogbG9jYXRpb24ucGF0aG5hbWUucmVwbGFjZSgvXlxcLy8sJycpLnNwbGl0KFwiL1wiKSwgICAvLyByZXR1cm5zIGFycmF5IG9mIHBhdGggc2VjdGlvbnMgXG4gIGhhc2ggOiBsb2NhdGlvbi5oYXNoLCBcdFx0XHRcdFx0Ly8gcmV0dXJucyAjcGFydDIgXG4gIGhyZWYgOiBsb2NhdGlvbi5ocmVmLCBcdFx0XHRcdFx0Ly8gcmV0dXJucyBodHRwOi8vd3d3LmZtLmNvbS90ZXN0Lmh0bSNwYXJ0MlxuICBxdWVyeXN0ciA6IGxvY2F0aW9uLnNlYXJjaCwgXHRcdFx0Ly8gcmV0dXJucyA/Zj10cnkmZz1pdCBpZiBVUkwgaXM6IGh0dHA6Ly9mbS5jb20vanMvYWEuY2dpP2Y9dHJ5Jmc9aXRcbiAgcmVmZXJyZXI6ICBkb2N1bWVudC5yZWZlcnJlciwgICAgICAgICAgLy8gcmV0dXJucyByZWZlcnJpbmcgcGFnZSwgaWYgYXZhaWxhYmxlXG4gIGZtVGltZXI6MCxcbiAgUXVlcnlQYWlycyA6IGxvY2F0aW9uLnNlYXJjaC5yZXBsYWNlKC9eXFw/LywnJykuc3BsaXQoL1xcJi8pLFxuICBzZXRDb29raWU6IGZ1bmN0aW9uIChhLGIsYyxkKXtifHwoYj1cIlwiKTtpZighY3x8aXNOYU4oYykpYz0uNTtkfHwoZD1cIi9cIik7dmFyIGU9bmV3IERhdGU7ZS5zZXRUaW1lKGUuZ2V0VGltZSgpK2MqMjQqNjAqNjAqMWUzKSxlPWUudG9HTVRTdHJpbmcoKSxhJiYoZG9jdW1lbnQuY29va2llPWErXCI9XCIrYitcIjtleHBpcmVzPVwiK2UrXCI7cGF0aD1cIitkKX0sXG4gIGdldENvb2tpZTpcdGZ1bmN0aW9uIChhKXt2YXIgYj1uZXcgUmVnRXhwKGErXCI9W147XStcIixcImlcIik7cmV0dXJuIGEmJmRvY3VtZW50LmNvb2tpZS5tYXRjaChiKT9kb2N1bWVudC5jb29raWUubWF0Y2goYilbMF0uc3BsaXQoXCI9XCIpWzFdOlwiXCJ9LFxuICBkZWxldGVDb29raWU6IGZ1bmN0aW9uIChhLGIpe2J8fChiPVwiL1wiKSxGTS5mb3JtLmdldENvb2tpZShhKSE9PVwiXCImJkZNLmZvcm0uc2V0Q29va2llKGEsXCJcIixcIi0xXCIsYil9LFxuICBsaW1pdFRleHQ6IGZ1bmN0aW9uKGEsYixtKSB7dmFyIHY9JChhKS52YWwoKSxsPXYubGVuZ3RoLG49bS1sLHI9bj09MT9uKycgY2hhcic6bisnIGNoYXJzJzsgaWYobD5tKXskKGEpLnZhbCh2LnN1YnN0cmluZygwLG0pKTt9ZWxzZSB7JChiKS5odG1sKHIpO319LFxuICB0cmltV2hpdGVTcGFjZTogZnVuY3Rpb24odil7diA9IHYucmVwbGFjZSgvXlxccysvLCcnKTt2ID0gdi5yZXBsYWNlKC9cXHMrJC8sJycpO3JldHVybiB2LnJlcGxhY2UoL1xcc3syLH0vZywnICcpO30sXG4gIGZvcmNlR2xvYmFsTGlua3MgOiAgZnVuY3Rpb24gKGEpe3ZhciBiPShGTS5mb3JtLmRvbWFpbithKS5yZXBsYWNlKC8oXFwvc2xlYXJuY3RyfFxcL2xvYW5sb29rdXApKHVhdCk/LyxcIlwiKTtyZXR1cm4gYn0sXG4gIHVzZU9tbmk6IGZhbHNlLFxuICB0b2dnbGVDbGljazpmdW5jdGlvbigpe3ZhciBmPWFyZ3VtZW50cztyZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uKCl7dmFyIGl0PTA7JCh0aGlzKS5vbihcImNsaWNrXCIsZnVuY3Rpb24oKXtmW2l0XS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO2l0PShpdCsxKSAlIGYubGVuZ3RoO30pO30pfSxcbiAgc2V0VGltZXI6IGZ1bmN0aW9uKHJvdXRpbmUsZGVsYXkpIHsgaWYocm91dGluZSAmJiBkZWxheT4wKXsgY2xlYXJUaW1lb3V0KEZNLmZvcm0uZm1UaW1lcik7IEZNLmZvcm0uZm1UaW1lciA9IHNldFRpbWVvdXQocm91dGluZSwgZGVsYXkpO319LFxuICByZXNldFJldmVhbDogZnVuY3Rpb24oKXtpZiAoJCgnLnJldmVhbDp2aXNpYmxlJykubGVuZ3RoID09PSAwKSB7JCgnLmlzLXJldmVhbC1vcGVuJykucmVtb3ZlQ2xhc3MoJ2lzLXJldmVhbC1vcGVuJyk7fX0sXG4gIG9mZnNldFJldmVhbDogZnVuY3Rpb24oKXt2YXIgcmV2ID0gJChcIi5yZXZlYWxbYXJpYS1oaWRkZW49J2ZhbHNlJ11cIikuZmlsdGVyKCcuZnVsbCcpOyAgaWYocmV2Lmxlbmd0aCl7IHJldi5jc3MoJ3RvcCcsIDApO319LFxuICBjdGE6IGZ1bmN0aW9uKGEsYil7aWYodHlwZW9mIGRhdGFMYXllciAhPSAndW5kZWZpbmVkJyl7YXx8KGE9XCJcIik7Ynx8KGI9XCJcIik7ZGF0YUxheWVyLnB1c2goeydldmVudCc6J2N0YUNsaWNrJywnY3RhVHlwZSc6YSwncGFyZW50Q29tcG9uZW50TmFtZSc6Yn0pO319XG59O1xuZm9yICh2YXIgeCBpbiBGTS5mb3JtLlF1ZXJ5UGFpcnMpIHtcbiAgUXVlcnlQYXJhbVtkZWNvZGVVUklDb21wb25lbnQoRk0uZm9ybS5RdWVyeVBhaXJzW3hdLnNwbGl0KCc9JylbMF0gfHwgXCJcIildID0gZGVjb2RlVVJJQ29tcG9uZW50KEZNLmZvcm0uUXVlcnlQYWlyc1t4XS5zcGxpdCgnPScpWzFdIHx8IFwiXCIpO1xufTtcblxuJChcImlucHV0W3R5cGU9J3RleHQnXSxpbnB1dFt0eXBlPSdzZWFyY2gnXSxpbnB1dFt0eXBlPSdlbWFpbCddXCIpLm9uKCdjaGFuZ2UnLGZ1bmN0aW9uKCl7dmFyIHYgPSAkKHRoaXMpLnZhbCgpOyQodGhpcykudmFsKEZNLmZvcm0udHJpbVdoaXRlU3BhY2UodikpO30pO1xuLy8gcHJvY2VzcyBvZmZzaXRlXG4kKCdbaHJlZl0nKS5maWx0ZXIoJy5vZmZzaXRlLCBbcmVsPVwiZXh0ZXJuYWxcIl0nKS5lYWNoKGZ1bmN0aW9uKCl7XG4gIHZhciB4ID0gJCh0aGlzKVswXS5oYXNBdHRyaWJ1dGUoJ3JlbCcpID8gJCh0aGlzKS5hdHRyKCdyZWwnKSA6ICcnLCAgeSA9IHghPT0nJyA/ICdub29wZW5lciBub3JlZmVycmVyICcreCA6ICdub29wZW5lciBub3JlZmVycmVyJztcdFxuICAkKHRoaXMpLmF0dHIoJ3RhcmdldCcsJ19ibGFuaycpLmF0dHIoJ3JlbCcseSk7IFxuICBcbn0pO1xuLy8gZml4IGh0dHBzIHJlbGF0aXZlIHVybHNcbmlmKEZNLmZvcm0ucHJvdG9jb2wgPT09ICdodHRwczonKSB7XHRcdFxuICAkKCcjaGVhZGVyLW5hdiwuZm9vdGVyJykuZmluZCgnYVtocmVmXj1cIi9cIl0nKS5lYWNoKGZ1bmN0aW9uKCl7XG5cdCAgJCh0aGlzKS5hdHRyKCdocmVmJywgRk0uZm9ybS5mb3JjZUdsb2JhbExpbmtzKCQodGhpcykuYXR0cignaHJlZicpKSk7XG4gIH0pO1x0XG4gICQoJ2Zvcm1bYWN0aW9uPVwiL2xvYW5sb29rdXAvc2VhcmNoL1wiXScpLmF0dHIoJ2FjdGlvbicsIFwiaHR0cDovL3d3dy5mcmVkZGllbWFjLmNvbS9zZWFyY2gvXCIpO1xuICAkKCcjYnJlYWRjcnVtYi13cmFwcGVyJykuZmluZCgnYScpLmVxKDApLmVhY2goZnVuY3Rpb24oKXtcblx0ICBpZiAoJCh0aGlzKS50ZXh0KCkubWF0Y2goL2hvbWUvaSkpICQodGhpcykuYXR0cignaHJlZicsIEZNLmZvcm0uZG9tYWluKTtcbiAgfSk7XHRcbn07XG4vLyBwcm9jZXNzIGZpbGUgbWFya2Vyc1xuaWYgKEZNLmZvcm0ucGF0aEVsZW1lbnRzWzBdICE9PSBcInNlYXJjaFwiKSB7IFxuXHQkKFwiLml3X3NlY3Rpb246Z3QoMClcIikuZmluZChcImFbaHJlZl1cIikubm90KCcucGxhaW4nKS5ub3QoXCI6aGFzKGltZylcIikubm90KFwiOmhhcyguY2FsbG91dClcIikubm90KFwiOmhhcyguY2FyZClcIikubm90KGZ1bmN0aW9uKCl7XG4gICAgcmV0dXJuICgvLitcXC4oaHRtbD98I3xqYXZhc2NyaXB0KShcXD8uKik/KCMuKik/JC9pKS50ZXN0KCQodGhpcykuYXR0cignaHJlZicpKTtcbiAgfSkuZmlsdGVyKGZ1bmN0aW9uKCl7XG4gICAgcmV0dXJuICgvLitcXC4ocGRmfHppcHxjc3Z8ZG9jfHhsc3xwcHQpW214XT8oXFw/LiopPygjLiopPyQvaSkudGVzdCgkKHRoaXMpLmF0dHIoJ2hyZWYnKSk7XG4gIH0pLmVhY2goZnVuY3Rpb24oKXsgXG4gICAgdmFyIGg9JCh0aGlzKS5hdHRyKCdocmVmJykudG9Mb3dlckNhc2UoKS5yZXBsYWNlKC8uK1xcLihwZGZ8emlwfGNzdnxkb2N8eGxzfHBwdClbbXhdPyhcXD8uKik/KCMuKik/JC8sIFwiJDFcIik7IFxuICAgIGlmICgkKHRoaXMpLmlzKCcuYnV0dG9uJykmJiBoLmxlbmd0aCkgeyAkKHRoaXMpLmFwcGVuZChcIiA8c3BhbiBjbGFzcz0naWNvbi1maWxlJz5cIitoK1wiPC9zcGFuPlwiKSB9ICAgICBcbiAgICBlbHNlIGlmKCQodGhpcykuY2xvc2VzdCgnLmRhdGEtZmlsdGVyYWJsZScpLmxlbmd0aD09MCkgeyAkKHRoaXMpLmFwcGVuZChcIiA8c3BhbiBjbGFzcz0naWNvbi1maWxlJz5cIitoK1wiPC9zcGFuPlwiKTsgfVxuICB9KTtcbn0gXG5cbiQoZnVuY3Rpb24oKXsgIFxuIC8vIGZpeCBmb3IgZnVsbCByZXZlYWxzIG5vdCByZXN0b3Jpbmcgc2Nyb2xsYmFyIG9uIGNsb3NlLCBtYXkgbm90IGJlIG5lZWRlZCBpZiBmaXhlZCBieSBadXJiLiBBbmltYXRpb24gdGFrZXMgMjUwbXNcbiAgJCh3aW5kb3cpLm9uKCdjbG9zZWQuemYucmV2ZWFsJywgZnVuY3Rpb24oKSB7XG4gICAgICBGTS5mb3JtLnJlc2V0UmV2ZWFsO1xuICAgICAgRk0uZm9ybS5zZXRUaW1lciA9IHNldFRpbWVvdXQoRk0uZm9ybS5yZXNldFJldmVhbCwgNDAwKTtcbiAgfSkub24oJ29wZW4uemYucmV2ZWFsJywgZnVuY3Rpb24oKSB7IFxuICAgICAgRk0uZm9ybS5zZXRUaW1lciA9IHNldFRpbWVvdXQoRk0uZm9ybS5vZmZzZXRSZXZlYWwsIDM1MCk7ICBcbiAgfSkub24oJ3Jlc2l6ZW1lLnpmLnRyaWdnZXInLCBmdW5jdGlvbigpIHsgXG4gICAgICBGTS5mb3JtLnNldFRpbWVyID0gc2V0VGltZW91dChGTS5mb3JtLm9mZnNldFJldmVhbCwgMzAwKTsgIFxuICB9KS5vbignY2hhbmdlLnpmLnRhYnMnLCBmdW5jdGlvbigpIHsgJCh3aW5kb3cpLnRyaWdnZXIoJ3Jlc2l6ZScpOyB9KTtcbn0pO1xuIiwiLy8gY29ycHJvYXRlIG5hdiByb3V0aW5lc1xuLy8gYm90aCBwcmltYXJ5IGFuZCBzdWJuYXYgZm9yIG5vdyAtLSBtYXkgYnJlYWsgYXBhcnQgaXIgbmVlZGVkXG5cbi8vIGFkZCBoaWdobGlnaHRpbmcgdG8gcGFyZW50IGxpbmsgaW4gZGVza3RvcCBuYXYgKG5vdCBkZXBlbmRhbnQgb24gcmVhZHkgZXZlbnQuKVxuJCgnI2Rlc2t0b3AtY29ycG9yYXRlLWhvbWUnKS5hZGRDbGFzcygnYWN0aXZlJyk7XG5cbi8vIHJvdXRpbmUgdG8gZGlzcGxheSB0aGUgc3VibmF2IG9uIGhvdmVyXG5mdW5jdGlvbiBuYXZIb3Zlck9mZigpe1xuICAkKCcubmF2LW1haW4nKS5maW5kKCcuY3VycmVudC1ob3ZlcicpLnJlbW92ZUNsYXNzKCdjdXJyZW50LWhvdmVyJyk7XG59XG5cbi8vIG1vYmlsZSB0b2dnbGVzXG52YXIgJHRvZ2dsZXMgPSAkKCcjc3VibmF2LXBlcnNwZWN0aXZlcy10b2dnbGUsICNzdWJuYXYtcmVzZWFyY2gtdG9nZ2xlLCAjc3VibmF2LWJsb2ctdG9nZ2xlLCAjc3VibmF2LW1lZGlhcm9vbS10b2dnbGUsICNzdWJuYXYtYWJvdXQtdG9nZ2xlJyk7XG4kdG9nZ2xlcy5lYWNoKGZ1bmN0aW9uKCl7ICBcbiAgJCh0aGlzKS5vbihcImNsaWNrXCIsIGZ1bmN0aW9uKCl7XG4gICAgaWYgKCFGb3VuZGF0aW9uLk1lZGlhUXVlcnkuYXRMZWFzdCgneGxhcmdlJykpIHtcbiAgICAgIHZhciBwYXJlbnRJRCA9ICQodGhpcykucGFyZW50KCdsaScpLmF0dHIoJ2lkJyk7XG4gICAgICAkKCcuc3VibmF2LWl0ZW0nKS5ub3QoJyMnK3BhcmVudElEKS5lYWNoKGZ1bmN0aW9uKCl7IFxuICAgICAgICBpZigkKHRoaXMpLmF0dHIoJ2FyaWEtZXhwYW5kZWQnKSA9PT0gXCJ0cnVlXCIpeyAgIFxuICAgICAgICAgICQodGhpcykuZmluZCgnLm1vYmlsZS1uYXYtYWNjb3JkaW9uLXBhcmVudCcpLnRyaWdnZXJIYW5kbGVyKCdjbGljaycpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gIH0pXG59KTtcbiBcbiQoJyNuYXYtcGVyc3BlY3RpdmVzLCAjbmF2LXJlc2VhcmNoLCAjbmF2LWJsb2csICNuYXYtbWVkaWFyb29tLCAjbmF2LWFib3V0LCAjc3VibmF2LXBlcnNwZWN0aXZlcywgI3N1Ym5hdi1yZXNlYXJjaCwgI3N1Ym5hdi1ibG9nLCAjc3VibmF2LW1lZGlhcm9vbSwgI3N1Ym5hdi1hYm91dCcpLmVhY2goZnVuY3Rpb24oKXsgIFxuICAkKHRoaXMpLm1vdXNlZW50ZXIoZnVuY3Rpb24oKXtcbiAgICBpZiAoRm91bmRhdGlvbi5NZWRpYVF1ZXJ5LmF0TGVhc3QoJ3hsYXJnZScpKSB7XG4gICAgICB2YXIgaSA9ICQodGhpcykuYXR0cignaWQnKS5yZXBsYWNlKC9eKHN1Yik/bmF2LyxcInNlY3Rpb25cIik7IFxuICAgICAgaWYoJCgnIycraSkubGVuZ3RoKXtcbiAgICAgICAgJCgnIycraSkubm90KCcuYWN0aXZlJykuYWRkQ2xhc3MoJ2N1cnJlbnQtaG92ZXInKTtcbiAgICAgIH1cbiAgICB9XG4gICAgfSkubW91c2VsZWF2ZShmdW5jdGlvbigpeyBuYXZIb3Zlck9mZigpO30pXG59KTtcblxuJChcIi5yaWJib24tcmJvLXNlY3Rpb25cIikub24oXCJtb3VzZWxlYXZlXCIsIGZ1bmN0aW9uKCl7IFxuICAgIHZhciAkdCA9ICQoXCIucmliYm9uLXJiby10b2dnbGVcIik7IFxuICAgIGlmKCR0LmF0dHIoJ2FyaWEtZXhwYW5kZWQnKSA9PT0gXCJ0cnVlXCIpe1xuICAgICAgJHQuZmluZCgnYScpLmJsdXIoKS50cmlnZ2VySGFuZGxlcignY2xpY2snKTtcbiAgICB9XG4gfSk7XG4kKFwiLm5hdi1idXMtc2VjdGlvblwiKS5vbihcIm1vdXNlbGVhdmVcIiwgZnVuY3Rpb24oKXsgXG4gICAgdmFyICR0ID0gJChcIi5uYXYtYnVzLXRvZ2dsZVwiKTsgXG4gICAgaWYoJHQuYXR0cignYXJpYS1leHBhbmRlZCcpID09PSBcInRydWVcIil7XG4gICAgICAkdC5maW5kKCdhJykuYmx1cigpLnRyaWdnZXJIYW5kbGVyKCdjbGljaycpOyBcbiAgICB9XG59KTsgXG5cbiQod2luZG93KS5vbignY2hhbmdlZC56Zi5tZWRpYXF1ZXJ5JywgZnVuY3Rpb24oZSwgblMsIG9TKXtcbiAgaWYoKG5TPT09XCJ4bGFyZ2VcIiB8fCBuUz09PVwieHhsYXJnZVwiKSAgJiYgKG9TPT09XCJzbWFsbFwiIHx8IG9TPT09XCJtZWRpdW1cIiB8fCBvUz09PVwibGFyZ2VcIikpe1xuICAgIGlmKCQoJyNuYXYtc2VhcmNoJykubGVuZ3RoICYmICQoJyNuYXYtc2VhcmNoJykuY3NzKCdkaXNwbGF5JykgIT09ICdub25lJykge1xuICAgICAgJChcIiNuYXYtc2VhcmNoXCIpLmZvdW5kYXRpb24oJ3RvZ2dsZScpO1xuICAgIH1cbiAgICAkKCcuaXMtYWNjb3JkaW9uLXN1Ym1lbnUtcGFyZW50W2FyaWEtZXhwYW5kZWQ9XCJ0cnVlXCJdJykuZWFjaCggIFxuICAgICAgZnVuY3Rpb24oKXsgXG4gICAgICAgICQuZngub2ZmID0gdHJ1ZTsgICBcbiAgICAgICAgJCh0aGlzKS5jbG9zZXN0KCdbZGF0YS1hY2NvcmRpb24tbWVudV0nKS5mb3VuZGF0aW9uKCdoaWRlQWxsJyk7XG4gICAgICAgICQuZngub2ZmID0gZmFsc2U7XG4gICAgICB9XG4gICAgKTtcbiAgICBpZiAoJCgnI2JvZHktd3JhcHBlcicpLmhhc0NsYXNzKCdpcy1tb2JpbGUtZXhwYW5kZWQnKSkge1xuICAgICAgJC5meC5vZmYgPSB0cnVlOyBcbiAgICAgICQoJyNuYXYtbWFpbicpLmZvdW5kYXRpb24oJ3RvZ2dsZScpO1xuICAgICAgJChcIiNib2R5LXdyYXBwZXJcIikuZm91bmRhdGlvbigndG9nZ2xlJyk7XG4gICAgICAkLmZ4Lm9mZiA9IGZhbHNlOyBcbiAgICB9XG4gIH0gXG4gIGVsc2UgaWYoKG9TPT09XCJ4bGFyZ2VcIiB8fCBvUz09PVwieHhsYXJnZVwiKSAmJiAoblM9PT1cInNtYWxsXCIgfHwgblM9PT1cIm1lZGl1bVwiIHx8IG5TPT09XCJsYXJnZVwiKSl7XG4gICAgbmF2SG92ZXJPZmYoKTsgXG4gIH1cbn0pO1xuXG4kKGZ1bmN0aW9uKCl7ICBcbiAgJChcIiNuYXYtc2VhcmNoXCIpLm9uKCdvbi56Zi50b2dnbGVyJywgZnVuY3Rpb24oKXsgXG4gICAgaWYgKCFGb3VuZGF0aW9uLk1lZGlhUXVlcnkuYXRMZWFzdCgneGxhcmdlJykpIHsgIFxuICAgICAgJChcIiNtb2JpbGUtc2VhcmNoXCIpLmZvY3VzKCk7XG4gICAgfVxuICAgIGlmICgkKCcjbmF2LW1haW4nKS5pcygnOnZpc2libGUnKSkge1xuICAgICAgJCgnI25hdi1tYWluJykuZm91bmRhdGlvbigndG9nZ2xlJyk7XG4gICAgfVxuICAgIGlmICgkKCcjYm9keS13cmFwcGVyJykuaGFzQ2xhc3MoJ2lzLW1vYmlsZS1leHBhbmRlZCcpKSB7XG4gICAgICAkKFwiI2JvZHktd3JhcHBlclwiKS5mb3VuZGF0aW9uKCd0b2dnbGUnKTtcbiAgICB9XG4gIH0pO1xuICAkKFwiI25hdi1zZWFyY2hcIikub24oJ29mZi56Zi50b2dnbGVyJywgZnVuY3Rpb24oKXsgXG4gICAgJChcIiNtb2JpbGUtc2VhcmNoXCIpLnZhbCgnJyk7ICBcbiAgfSk7XG4gICQoXCIjbmF2LW1haW5cIikub24oJ29uLnpmLnRvZ2dsZXInLCBmdW5jdGlvbigpeyBcbiAgICBpZigkKCcjbmF2LXNlYXJjaCcpLmxlbmd0aCAmJiAkKCcjbmF2LXNlYXJjaCcpLmNzcygnZGlzcGxheScpICE9PSAnbm9uZScpIHtcbiAgICAgICQoXCIjbmF2LXNlYXJjaFwiKS5mb3VuZGF0aW9uKCd0b2dnbGUnKTtcbiAgICB9XG4gIH0pO1xuICAkKFwiI25hdi1tYWluXCIpLm9uKCdvZmYuemYudG9nZ2xlcicsIGZ1bmN0aW9uKCl7IFxuICAgIGlmICgkKCcjYm9keS13cmFwcGVyJykuaGFzQ2xhc3MoJ2lzLW1vYmlsZS1leHBhbmRlZCcpKSB7XG4gICAgICAkKFwiI2JvZHktd3JhcHBlclwiKS5mb3VuZGF0aW9uKCd0b2dnbGUnKTtcbiAgICB9XG4gIH0pO1xufSk7IiwidmFyIGFkanVzdFNpZGVCYXIgPSB7XG5cdGluaXQ6IGZ1bmN0aW9uKCkgeyAgXG4gICAgdmFyICRzaWRlID0gJCgnLml3X2NvbHVtbnMnKS5maWx0ZXIoJy5sYXJnZS01OmZpcnN0JyksXG4gICAgaGVybyA9ICQoJy5oZXJvLWJsZW5kZWQ6Zmlyc3QnKS5vdXRlckhlaWdodCgpIHx8IDAsXG4gICAgY250UGRnID0gRm91bmRhdGlvbi5NZWRpYVF1ZXJ5LmF0TGVhc3QoJ3hsYXJnZScpID8gNTggOiBGb3VuZGF0aW9uLk1lZGlhUXVlcnkuYXRMZWFzdCgnbGFyZ2UnKSA/IDMyIDogMCxcbiAgICBzZEJhciA9ICRzaWRlLmZpbmQoJy5zaWRlYmFyOmZpcnN0Jykub3V0ZXJIZWlnaHQodHJ1ZSk7ICAgICAgICBcblx0XHRpZiggRm91bmRhdGlvbi5NZWRpYVF1ZXJ5LmF0TGVhc3QoJ2xhcmdlJykgKSB7ICAgICBcbiAgICAgIGlmKHNkQmFyIDwgaGVybykgeyAkc2lkZS5jc3MoJ21hcmdpbi10b3AnLCAtKHNkQmFyK2NudFBkZykpOyB9XG4gICAgICBlbHNlIGlmIChoZXJvID4gMCkgeyAkc2lkZS5jc3MoJ21hcmdpbi10b3AnLCAtKGhlcm8vMiArY250UGRnKSk7IH1cblx0XHRcdGVsc2UgeyAkc2lkZS5jc3MoJ21hcmdpbi10b3AnLCAtNTApOyB9XG5cdFx0fSBcbiAgICBlbHNlIHtcblx0XHRcdCRzaWRlLnJlbW92ZUF0dHIoJ3N0eWxlJyk7XG5cdFx0fVxuXHR9XG59O1xuXG4kKGZ1bmN0aW9uKCl7XG4gIGlmICgkKCcuYmxvZy1kZXRhaWwtaGVybycpLmxlbmd0aCB8fCAkKCcucGVyc3BlY3RpdmVzLWRldGFpbC1oZXJvJykubGVuZ3RoKSB7XG4gICAgYWRqdXN0U2lkZUJhci5pbml0KCk7XG4gICAgJCh3aW5kb3cpLm9uKCdjaGFuZ2VkLnpmLm1lZGlhcXVlcnknLCBmdW5jdGlvbigpIHtcbiAgICAgIGFkanVzdFNpZGVCYXIuaW5pdCgpO1xuICAgIH0pOyAgICAgXG4gIH1cbn0pO1xuXG4iLCJmdW5jdGlvbiBjbG9zZXN0QmxvY2tQYXJlbnQoaXRlbSkge1xuICAkKGl0ZW0pLnBhcmVudHMoKS5lYWNoKGZ1bmN0aW9uKCl7XG4gICAgaWYgKCQodGhpcykuY3NzKCdkaXNwbGF5JykgPT0gJ2Jsb2NrJykge1xuICAgICAgICByZXR1cm4gJCh0aGlzKTtcbiAgICB9XG4gIH0pOyAgXG59XG5cbi8vICBwcmVwIGNvbnRlbnQgZm9yIG1vZGFscyBieSBhZGRpbmcgYnV0dG9uc1xuZnVuY3Rpb24gcHJlUmV2ZWFsKCkge1xuICAkKFwiLnJldmVhbFtpZF1bZGF0YS1yZXZlYWxdXCIpLm5vdCgnLm92ZXJsYXktdmlkZW8nKS5lYWNoKGZ1bmN0aW9uKCl7XG4gICAgdmFyICBvYmogPSAkKHRoaXMpLCBcbiAgICBpID0gb2JqLmF0dHIoJ2lkJyksXG4gICAgc3ZnQ2xvc2UgPSAnPHN2ZyBhcmlhLWhpZGRlbj1cInRydWVcIiB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIgdmlld0JveD1cIjAgMCAxNjcuMzkgMTY3LjM5XCI+PHBhdGggZmlsbD1cIiNmZmZcIiBkPVwiTTgzLjcgMGE4My43IDgzLjcgMCAxIDAgODMuNyA4My43QTgzLjcgODMuNyAwIDAgMCA4My43IDB6bTQyLjY3IDEyNy4wNmE2LjEzIDYuMTMgMCAwIDEtOC42Ny0uMDdsLTM0LTM0LjU1TDQ5LjY5IDEyN2E2LjEzIDYuMTMgMCAxIDEtOC43NC04LjZMNzUuMSA4My43IDQxIDQ5YTYuMTMgNi4xMyAwIDEgMSA4Ljc0LTguNkw4My43IDc1bDM0LTM0LjU1YTYuMTMgNi4xMyAwIDEgMSA4Ljc0IDguNkw5Mi4yOSA4My43bDM0LjE0IDM0LjY5YTYuMTMgNi4xMyAwIDAgMS0uMDYgOC42N3pcIi8+PC9zdmc+JywgICAgXG4gICAgYnRuQ2xvc2UgPSAkKFwiPGJ1dHRvbiAvPlwiLHtcbiAgICBcImNsYXNzXCI6IFwiY2xvc2UtYnV0dG9uXCIsXG4gICAgXCJhcmlhLWxhYmVsXCI6IFwiQ2xvc2UgbW9kYWxcIixcbiAgICBcImRhdGEtY2xvc2VcIjogXCJcIixcbiAgICBcInR5cGVcIjogXCJidXR0b25cIixcbiAgICBcImh0bWxcIjogXCI8c3BhbiBhcmlhLWhpZGRlbj0ndHJ1ZSc+XCIrc3ZnQ2xvc2UrXCI8L3NwYW4+XCJcbiAgICB9KTtcbiAgICBpZigkKHRoaXMpLmZpbHRlcignLm92ZXJsYXktaW1hZ2UsIC5vdmVybGF5LWdhbGxlcnknKS5sZW5ndGgpeyAgXG4gICAgICBvYmouZmluZCgnaW1nOmZpcnN0JykuYWZ0ZXIoYnRuQ2xvc2UpOyBcbiAgICAgICQoJ2FbZGF0YS1vcGVuPVwiJytpKydcIl1baHJlZl0nKS5vbihcImNsaWNrXCIsZnVuY3Rpb24oZSl7IGUucHJldmVudERlZmF1bHQoKTsgfSk7IFxuICAgICAgb2JqLmZpbmQoJy5tb2RhbC1jb250ZW50Jykub24oXCJjbGlja1wiLGZ1bmN0aW9uKCl7IG9iai5mb3VuZGF0aW9uKCdjbG9zZScpOyB9KTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBvYmouZmluZCgnLm1vZGFsLWhlYWRlcjpmaXJzdCcpLmFwcGVuZChidG5DbG9zZSk7XG4gICAgfVxuICAgIG9iai5ub3QoJy5vdmVybGF5LWdhbGxlcnknKS5hdHRyKCdkYXRhLWFuaW1hdGlvbi1pbicsIFwic2NhbGUtaW4tdXBcIikuYXR0cignZGF0YS1hbmltYXRpb24tb3V0JywgXCJzY2FsZS1vdXQtZG93blwiKS5hZGRDbGFzcygnZmFzdCcpO1xuICB9KTsgXG59XG5cbmZ1bmN0aW9uIHByZVJldmVhbEdhbGxlcnkoKSB7XG4gIHZhciBnYWxsZXJ5UmVsID0gW107XG4gICQoXCIucmV2ZWFsW2lkXVtkYXRhLXJldmVhbF1cIikuZmlsdGVyKCcub3ZlcmxheS1nYWxsZXJ5W3JlbF0nKS5lYWNoKGZ1bmN0aW9uKCl7XG4gICAgdmFyIHJlbD0kKHRoaXMpLmF0dHIoJ3JlbCcpO1xuICAgIGlmICgkLmluQXJyYXkocmVsLGdhbGxlcnlSZWwpIDwgMCl7Z2FsbGVyeVJlbC5wdXNoKHJlbCk7fVxuICB9KTtcbiAgd2hpbGUgKGdhbGxlcnlSZWwubGVuZ3RoID4gMCkge1xuICAgIHZhciAkciA9IGdhbGxlcnlSZWwuc2hpZnQoKSwgZ2FsbGVyeUNvdW50ID0gJChcIi5yZXZlYWxbaWRdW2RhdGEtcmV2ZWFsXVwiKS5maWx0ZXIoXCJbcmVsPVwiICsgJHIgKyBcIl1cIikubGVuZ3RoO1xuICAgICQoXCIucmV2ZWFsW2lkXVtkYXRhLXJldmVhbF1cIikuZmlsdGVyKFwiW3JlbD1cIiArICRyICsgXCJdXCIpLmVhY2goZnVuY3Rpb24oeCl7IFxuICAgICAgdmFyICBvYmogPSAkKHRoaXMpLCBcbiAgICAgIHByZXZJdGVtID0gKHggPT0gMCkgPyAoZ2FsbGVyeUNvdW50IC0gMSkgOiAoeCAtIDEpLFxuICAgICAgbmV4dEl0ZW0gPSAoeCA9PSBnYWxsZXJ5Q291bnQgLSAxKSA/IDAgOiAoeCArIDEpLFxuICAgICAgcHJldklEID0gJChcIltyZWw9XCIgKyAkciArIFwiXVwiKS5lcShwcmV2SXRlbSkuYXR0cignaWQnKSxcbiAgICAgIG5leHRJRCA9ICQoXCJbcmVsPVwiICsgJHIgKyBcIl1cIikuZXEobmV4dEl0ZW0pLmF0dHIoJ2lkJyksXG4gICAgICBidG5QcmV2ID0gJChcIjxidXR0b24gLz5cIix7XG4gICAgICAgIFwiY2xhc3NcIjogXCJvcmJpdC1wcmV2aW91c1wiLFxuICAgICAgICBcImRhdGEtb3BlblwiOiBwcmV2SUQsXG4gICAgICAgIFwidHlwZVwiOiBcImJ1dHRvblwiLFxuICAgICAgICBcImh0bWxcIjogJzxzcGFuIGNsYXNzPVwic2hvdy1mb3Itc3JcIj5wcmV2aW91cyBzbGlkZTwvc3Bhbj48c3ZnIGFyaWEtaGlkZGVuPVwidHJ1ZVwiIHdpZHRoPVwiMWVtXCIgaGVpZ2h0PVwiMWVtXCIgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiIHZpZXdCb3g9XCIxNCAxNCAyMiAyMlwiPjxwYXRoIGQ9XCJNMjcuMyAzNC43TDE3LjYgMjVsOS43LTkuNyAxLjQgMS40LTguMyA4LjMgOC4zIDguM3pcIi8+PC9zdmc+J1xuICAgICAgfSksXG4gICAgICBidG5OZXh0ID0gJChcIjxidXR0b24gLz5cIix7XG4gICAgICAgIFwiY2xhc3NcIjogXCJvcmJpdC1uZXh0XCIsXG4gICAgICAgIFwiZGF0YS1vcGVuXCI6IG5leHRJRCxcbiAgICAgICAgXCJ0eXBlXCI6IFwiYnV0dG9uXCIsXG4gICAgICAgIFwiaHRtbFwiOiAnPHNwYW4gY2xhc3M9XCJzaG93LWZvci1zclwiPm5leHQgc2xpZGU8L3NwYW4+PHN2ZyBhcmlhLWhpZGRlbj1cInRydWVcIiB3aWR0aD1cIjFlbVwiIGhlaWdodD1cIjFlbVwiIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiB2aWV3Qm94PVwiMTQgMTQgMjIgMjJcIj48cGF0aCBkPVwiTTIyLjcgMzQuN2wtMS40LTEuNCA4LjMtOC4zLTguMy04LjMgMS40LTEuNCA5LjcgOS43elwiLz48L3N2Zz4nXG4gICAgICB9KTtcbiAgICAgIG9iai5maW5kKCdmaWd1cmUnKS5hcHBlbmQoYnRuTmV4dCwgYnRuUHJldik7XG4gICAgICBvYmouYXR0cignZGF0YS1hbmltYXRpb24taW4nLCBcImZhZGUtaW5cIikuYXR0cignZGF0YS1hbmltYXRpb24tb3V0JywgXCJmYWRlLW91dFwiKS5hZGRDbGFzcygnZmFzdCcpO1xuICAgIH0pO1xuICB9ICAgXG59XG5mdW5jdGlvbiBwcmVSZXZlYWxWaWRlbygpIHsgIFxuICB2YXIgdyA9IHdpbmRvdy5pbm5lcldpZHRofHwgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudFdpZHRofHwgZG9jdW1lbnQuYm9keS5jbGllbnRXaWR0aDsgXG4gIGlmICh3IDw9IDQ1MCkgeyByZXR1cm47IH1cbiAgdmFyIHN2Z0Nsb3NlID0gJzxzdmcgY2xhc3M9XCJzbG93XCIgYXJpYS1oaWRkZW49XCJ0cnVlXCIgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiIHZpZXdCb3g9XCIwIDAgMTY3LjM5IDE2Ny4zOVwiPjxwYXRoIGZpbGw9XCIjZmZmXCIgZD1cIk04My43IDBhODMuNyA4My43IDAgMSAwIDgzLjcgODMuN0E4My43IDgzLjcgMCAwIDAgODMuNyAwem00Mi42NyAxMjcuMDZhNi4xMyA2LjEzIDAgMCAxLTguNjctLjA3bC0zNC0zNC41NUw0OS42OSAxMjdhNi4xMyA2LjEzIDAgMSAxLTguNzQtOC42TDc1LjEgODMuNyA0MSA0OWE2LjEzIDYuMTMgMCAxIDEgOC43NC04LjZMODMuNyA3NWwzNC0zNC41NWE2LjEzIDYuMTMgMCAxIDEgOC43NCA4LjZMOTIuMjkgODMuN2wzNC4xNCAzNC42OWE2LjEzIDYuMTMgMCAwIDEtLjA2IDguNjd6XCIvPjwvc3ZnPicsICAgIFxuICAgIGJ0bkNsb3NlID0gJzxidXR0b24gY2xhc3M9XCJjbG9zZS1idXR0b25cIiBhcmlhLWxhYmVsPVwiQ2xvc2UgbW9kYWxcIiBkYXRhLWNsb3NlIHR5cGU9XCJidXR0b25cIj48c3BhbiBhcmlhLWhpZGRlbj1cInRydWVcIj4nK3N2Z0Nsb3NlKyc8L3NwYW4+PC9idXR0b24+JyxcbiAgICBmcmFtZUF0dHJpYnV0ZXMgPSAnZnJhbWVib3JkZXI9XCIwXCIgYWxsb3dmdWxsc2NyZWVuIGFsbG93c2NyaXB0YWNjZXNzPVwiYWx3YXlzXCIgYWxsb3c9XCJhY2NlbGVyb21ldGVyOyBhdXRvcGxheTsgZW5jcnlwdGVkLW1lZGlhOyBneXJvc2NvcGU7IHBpY3R1cmUtaW4tcGljdHVyZVwiJyxcbiAgICAkZnJhbWVXaWRlID0gJzxpZnJhbWUgaWQ9XCJmcmFtZVdpZGVZVFwiIHNyYz1cIlwiICcrZnJhbWVBdHRyaWJ1dGVzKyc+PC9pZnJhbWU+JyxcbiAgICAkZnJhbWVTdGFuZGFyZCA9ICc8aWZyYW1lIGlkPVwiZnJhbWVTdGFuZGFyZFlUXCIgc3JjPVwiXCIgJytmcmFtZUF0dHJpYnV0ZXMrJz48L2lmcmFtZT4nLFxuICAgIG1vZGFsV2lkZSA9ICQoXCI8ZGl2IC8+XCIse1xuICAgICAgXCJjbGFzc1wiOiBcInJldmVhbCBvdmVybGF5LXZpZGVvIGZhc3RcIixcbiAgICAgIFwiZGF0YS1yZXZlYWxcIjogXCJcIixcbiAgICAgIFwiZGF0YS1yZXNldC1vbi1jbG9zZVwiOiB0cnVlLFxuICAgICAgXCJkYXRhLWRlZXAtbGlua1wiOiBmYWxzZSxcbiAgICAgIFwiaWRcIjogXCJ2aWRlb1dpZGVZVFwiLFxuICAgICAgXCJkYXRhLWFuaW1hdGlvbi1pblwiIDogXCJzY2FsZS1pbi1kb3duXCIsXG4gICAgICBcImRhdGEtYW5pbWF0aW9uLW91dFwiIDogXCJzY2FsZS1vdXQtdXBcIixcbiAgICAgIFwiaHRtbFwiOiBidG5DbG9zZSArICc8ZGl2IGNsYXNzPVwicmVzcG9uc2l2ZS1lbWJlZCB3aWRlc2NyZWVuXCI+JyskZnJhbWVXaWRlKyc8L2Rpdj4nXG4gICAgfSksXG4gICAgbW9kYWxTdGFuZGFyZCA9ICQoXCI8ZGl2IC8+XCIse1xuICAgICAgXCJjbGFzc1wiOiBcInJldmVhbCBvdmVybGF5LXZpZGVvXCIsXG4gICAgICBcImRhdGEtcmV2ZWFsXCI6IFwiXCIsXG4gICAgICBcImRhdGEtcmVzZXQtb24tY2xvc2VcIjogdHJ1ZSxcbiAgICAgIFwiZGF0YS1kZWVwLWxpbmtcIjogZmFsc2UsXG4gICAgICBcImlkXCI6IFwidmlkZW9TdGFuZGFyZFlUXCIsXG4gICAgICBcImRhdGEtYW5pbWF0aW9uLWluXCIgOiBcInNjYWxlLWluLWRvd25cIixcbiAgICAgIFwiZGF0YS1hbmltYXRpb24tb3V0XCIgOiBcInNjYWxlLW91dC11cFwiLFxuICAgICAgXCJodG1sXCI6IGJ0bkNsb3NlICsgJzxkaXYgY2xhc3M9XCJyZXNwb25zaXZlLWVtYmVkXCI+JyskZnJhbWVTdGFuZGFyZCsnPC9kaXY+J1xuICAgIH0pO1xuICBpZigkKFwiLnZpZGVvLW1vZGFsW2RhdGEtc3JjXVwiKS5maWx0ZXIoJy53aWRlc2NyZWVuLXZpZGVvJykubGVuZ3RoKXtcbiAgICAkKCdib2R5JykucHJlcGVuZChtb2RhbFdpZGUpOyBcbiAgICAkKCcjdmlkZW9XaWRlWVQnKS5vbignY2xvc2VkLnpmLnJldmVhbCcsIGZ1bmN0aW9uKCl7XG4gICAgICAkKCcjZnJhbWVXaWRlWVQnKS5yZXBsYWNlV2l0aCgkZnJhbWVXaWRlKTtcbiAgICB9KTtcbiAgfVxuICBpZigkKFwiLnZpZGVvLW1vZGFsW2RhdGEtc3JjXVwiKS5sZW5ndGggPiAkKFwiLnZpZGVvLW1vZGFsW2RhdGEtc3JjXVwiKS5maWx0ZXIoJy53aWRlc2NyZWVuLXZpZGVvJykubGVuZ3RoKXsgIFxuICAgICQoJ2JvZHknKS5wcmVwZW5kKG1vZGFsU3RhbmRhcmQpOyBcbiAgICAkKCcjdmlkZW9TdGFuZGFyZFlUJykub24oJ2Nsb3NlZC56Zi5yZXZlYWwnLCBmdW5jdGlvbigpe1xuICAgICAgJCgnI2ZyYW1lU3RhbmRhcmRZVCcpLnJlcGxhY2VXaXRoKCRmcmFtZVN0YW5kYXJkKTtcbiAgICB9KTtcbiAgfVxuICAkKFwiLnZpZGVvLW1vZGFsW2RhdGEtc3JjXVwiKS5lYWNoKGZ1bmN0aW9uKHgpeyAgICBcbiAgICB2YXIgJGxuayA9ICQodGhpcyksXG4gICAgICAkc3JjID0gJGxuay5hdHRyKCdkYXRhLXNyYycpLFxuICAgICAgdGFyZ2V0SWQgPSAkbG5rLmhhc0NsYXNzKCd3aWRlc2NyZWVuLXZpZGVvJykgPyAgJ3ZpZGVvV2lkZVlUJyA6ICd2aWRlb1N0YW5kYXJkWVQnO1xuICAgICRsbmsuYXR0cignZGF0YS1vcGVuJywgdGFyZ2V0SWQpLmF0dHIoJ2FyaWEtY29udHJvbHMnLCB0YXJnZXRJZCk7ICAgICAgICAgXG4gICAgJGxuay5vbihcImNsaWNrXCIsZnVuY3Rpb24oZSl7IFxuICAgICAgdyA9IHdpbmRvdy5pbm5lcldpZHRoIHx8IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRXaWR0aCB8fCBkb2N1bWVudC5ib2R5LmNsaWVudFdpZHRoOyBcbiAgICAgIGlmICh3ID4gNDUwKSB7IFxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7IFxuICAgICAgfVxuICAgICAgaWYoJGxuay5oYXNDbGFzcygnd2lkZXNjcmVlbi12aWRlbycpKSB7XG4gICAgICAgICQoJyNmcmFtZVdpZGVZVCcpLmF0dHIoJ3NyYycsICRzcmMrJyZhdXRvcGxheT0xJmVuYWJsZWpzYXBpPTEnKTtcbiAgICAgICAgJCgnI2ZyYW1lV2lkZVlUJykub24oXCJjbGlja1wiLGZ1bmN0aW9uKCl7XG4gICAgICAgICAgJCh0aGlzKS5mb3VuZGF0aW9uKCdjbG9zZScpO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICAkKCcjZnJhbWVTdGFuZGFyZFlUJykuYXR0cignc3JjJywkc3JjKycmYXV0b3BsYXk9MSZlbmFibGVqc2FwaT0xJyk7XG4gICAgICAgICQoJyN2aWRlb1N0YW5kYXJkWVQnKS5mb3VuZGF0aW9uKCdvcGVuJykub24oXCJjbGlja1wiLGZ1bmN0aW9uKCl7XG4gICAgICAgICAgJCh0aGlzKS5mb3VuZGF0aW9uKCdjbG9zZScpO1xuICAgICAgICB9KTtcbiAgICAgIH0gICAgIFxuICAgIH0pOyBcbiAgICAgIFxuICB9KTtcbn0gXG5pZigkKFwiLnJldmVhbFwiKS5sZW5ndGgpeyBcbiAgcHJlUmV2ZWFsKCk7XG59XG5pZigkKFwiLm92ZXJsYXktZ2FsbGVyeVwiKS5sZW5ndGgpe1xuICBwcmVSZXZlYWxHYWxsZXJ5KCk7XG59XG5pZigkKFwiLnZpZGVvLW1vZGFsXCIpLmxlbmd0aCkgeyBcbiAgcHJlUmV2ZWFsVmlkZW8oKTtcbn1cblxuIFxuIiwiLy8gcHJlcCBjb250ZW50IGZvciBSb3RhdG9ycyB1c2luZyBPcmJpdFxuLy9hdXRvbWF0ZSBpbnNlcnRpb24gb2YgQ2xvc2UgQnV0dG9ucyBhbmQgYWN0aXZlIGl0ZW0gaGlnaGxpZ2h0aW5nXG5mdW5jdGlvbiBvcmJCdWxsZXRNYXJrdXAoY29udGFpbmVyLCBzbENsYXNzKXtcbiAgdmFyIG9yYkJ1bGxldHMgPSAnJztcbiAgY29udGFpbmVyLmZpbmQoJy4nK3NsQ2xhc3MpLmVhY2goZnVuY3Rpb24oaSl7ICAgIFxuICAgIG9yYkJ1bGxldHMgKz0gJzxidXR0b24gdHlwZT1cImJ1dHRvblwiIGRhdGEtc2xpZGU9XCInICsgaSArICdcIj48c3BhbiBjbGFzcz1cInNob3ctZm9yLXNyXCI+c2xpZGUgJysgKGkrMSkgKyAnPC9zcGFuPjwvYnV0dG9uPic7ICBcbiAgfSk7IFxuICByZXR1cm4gb3JiQnVsbGV0cztcbn1cbi8vIG15IGF0dGVtcHQgdG8gZHVwbGljYXRlIHRoZSBoZWlnaHQgbG9naWMgYW5kIHJlc2V0IGl0IGFzIG5lZWRlZFxuZnVuY3Rpb24gcmVjYWxjT3JiaXQoKSB7XG4gICQoJy5vcmJpdCcpLmVhY2goZnVuY3Rpb24oeCkge1xuICAgIHZhciBtYXggPSAwLCB0ZW1wLCBjb3VudGVyID0gMCwgXG4gICAgb3JiID0gJCh0aGlzKSwgICAgXG4gICAgc2xpZGVDbGFzcyA9IG9yYi5hdHRyKCdkYXRhLXNsaWRlLWNsYXNzJykgfHwgXCJvcmJpdC1zbGlkZVwiLFxuICAgIG9yYkNvbnRhaW5lckNsYXNzID0gb3JiLmF0dHIoJ2RhdGEtY29udGFpbmVyLWNsYXNzJykgfHwgXCJvcmJpdC1jb250YWluZXJcIixcbiAgICAkd3JhcHBlciA9IG9yYi5maW5kKCcuJytvcmJDb250YWluZXJDbGFzcyksXG4gICAgJHNsaWRlcyA9IG9yYi5maW5kKCcuJytzbGlkZUNsYXNzKTtcbiAgICAkd3JhcHBlci5jc3MoeydoZWlnaHQnOiAnYXV0byd9KTsgXG4gICAgJHNsaWRlcy5lYWNoKGZ1bmN0aW9uKCkge1xuICAgICAgdGVtcCA9IHRoaXMuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkuaGVpZ2h0O1xuICAgICAgJCh0aGlzKS5hdHRyKCdkYXRhLXNsaWRlJywgY291bnRlcik7XG4gICAgICBpZiAoJHNsaWRlcy5maWx0ZXIoJy5pcy1hY3RpdmUnKVswXSAhPT0gJHNsaWRlcy5lcShjb3VudGVyKVswXSkge1xuICAgICAgICAkKHRoaXMpLmNzcyh7J3Bvc2l0aW9uJzogJ3JlbGF0aXZlJywgJ2Rpc3BsYXknOiAnbm9uZSd9KTtcbiAgICAgIH1cbiAgICAgIG1heCA9IHRlbXAgPiBtYXggPyB0ZW1wIDogbWF4O1xuICAgICAgY291bnRlcisrO1xuICAgIH0pO1xuICAgIGlmIChjb3VudGVyID09PSAkc2xpZGVzLmxlbmd0aCkge1xuICAgICAgJHdyYXBwZXIuY3NzKHsnaGVpZ2h0JzogbWF4fSk7IFxuICAgIH1cbiAgfSkgIFxufVxuXG5mdW5jdGlvbiBwcmVPcmJpdCgpIHsgIFxuICAkKCcub3JiaXQnKS5lYWNoKGZ1bmN0aW9uKHgpIHtcbiAgICB2YXIgb3JiID0gJCh0aGlzKSwgXG4gICAgdXNlQnVsbGV0cyA9IG9yYi5hdHRyKCdkYXRhLWJ1bGxldHMnKSB8fCBcInRydWVcIixcbiAgICB1c2VCdXR0b25zID0gb3JiLmF0dHIoJ2RhdGEtbmF2LWJ1dHRvbnMnKSB8fCBcInRydWVcIiwgXG4gICAgYnV0dG9uUGFyZW50Q2xhc3MgPSBvcmIuYXR0cignZGF0YS1uYXYtcGFyZW50LWNsYXNzJykgfHwgJ29yYml0JztcbiAgICBidWxsZXRCb3ggPSBvcmIuYXR0cignZGF0YS1ib3gtb2YtYnVsbGV0cycpIHx8IFwib3JiaXQtYnVsbGV0c1wiLFxuICAgIHNsaWRlQ2xhc3MgPSBvcmIuYXR0cignZGF0YS1zbGlkZS1jbGFzcycpIHx8IFwib3JiaXQtc2xpZGVcIixcbiAgICBvcmJDb250YWluZXJDbGFzcyA9IG9yYi5hdHRyKCdkYXRhLWNvbnRhaW5lci1jbGFzcycpIHx8IFwib3JiaXQtY29udGFpbmVyXCIsXG4gICAgbmV4dEJ0bkNsYXNzID0gb3JiLmF0dHIoJ2RhdGEtbmV4dC1jbGFzcycpID8gXCJvcmJpdC1uZXh0IFwiICsgb3JiLmF0dHIoJ2RhdGEtbmV4dC1jbGFzcycpIDogXCJvcmJpdC1uZXh0XCIsXG4gICAgcHJldkJ0bkNsYXNzID0gb3JiLmF0dHIoJ2RhdGEtcHJldi1jbGFzcycpID8gXCJvcmJpdC1wcmV2aW91cyBcIiArIG9yYi5hdHRyKCdkYXRhLXByZXYtY2xhc3MnKSA6IFwib3JiaXQtcHJldmlvdXNcIixcbiAgICBvcmJDb250YWluZXIgPSBvcmIuZmluZCgnLicrb3JiQ29udGFpbmVyQ2xhc3MrJzpmaXJzdCcpLFxuICAgIG9yYlNsaWRlcyA9IG9yYkNvbnRhaW5lci5jaGlsZHJlbignLicrc2xpZGVDbGFzcyksXG4gICAgdXNlT3ZlcmxheSA9IG9yYi5oYXNDbGFzcygnYnVsbGV0cy1vdmVybGF5JyksXG4gICAgYWN0aXZlU2xpZGUgPSAwLFxuICAgIGF1dG9tYXRlTmF2ID0gb3JiLmF0dHIoJ2RhdGEtYXV0b21hdGUtbmF2JykgfHwgXCJ0cnVlXCIsXG4gICAgYnRuUHJldiA9ICQoXCI8YnV0dG9uIC8+XCIse1xuICAgICAgXCJjbGFzc1wiOiBwcmV2QnRuQ2xhc3MsXG4gICAgICBcInR5cGVcIjogJ2J1dHRvbicsXG4gICAgICBcImh0bWxcIjogJzxzcGFuIGNsYXNzPVwic2hvdy1mb3Itc3JcIj5wcmV2aW91cyBzbGlkZTwvc3Bhbj48c3ZnIGFyaWEtaGlkZGVuPVwidHJ1ZVwiIHdpZHRoPVwiMWVtXCIgaGVpZ2h0PVwiMWVtXCIgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiIHZpZXdCb3g9XCIwIDAgNTEyIDUxMlwiPjxwYXRoIGQ9XCJNMjEzLjcsMjU2TDIxMy43LDI1NkwyMTMuNywyNTZMMzgwLjksODEuOWM0LjItNC4zLDQuMS0xMS40LTAuMi0xNS44bC0yOS45LTMwLjZjLTQuMy00LjQtMTEuMy00LjUtMTUuNS0wLjJMMTMxLjEsMjQ3LjlcdGMtMi4yLDIuMi0zLjIsNS4yLTMsOC4xYy0wLjEsMywwLjksNS45LDMsOC4xbDIwNC4yLDIxMi43YzQuMiw0LjMsMTEuMiw0LjIsMTUuNS0wLjJsMjkuOS0zMC42YzQuMy00LjQsNC40LTExLjUsMC4yLTE1LjggTDIxMy43LDI1NnpcIi8+PC9zdmc+J1xuICAgIH0pLFxuICAgIGJ0bk5leHQgPSAkKFwiPGJ1dHRvbiAvPlwiLHtcbiAgICAgIFwiY2xhc3NcIjogbmV4dEJ0bkNsYXNzLFxuICAgICAgXCJ0eXBlXCI6ICdidXR0b24nLFxuICAgICAgXCJodG1sXCI6ICc8c3BhbiBjbGFzcz1cInNob3ctZm9yLXNyXCI+bmV4dCBzbGlkZTwvc3Bhbj48c3ZnIGFyaWEtaGlkZGVuPVwidHJ1ZVwiIHdpZHRoPVwiMWVtXCIgaGVpZ2h0PVwiMWVtXCIgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiIHZpZXdCb3g9XCIwIDAgNTEyIDUxMlwiPjxwYXRoIGQ9XCJNMjk4LjMsMjU2TDI5OC4zLDI1NkwyOTguMywyNTZMMTMxLjEsODEuOWMtNC4yLTQuMy00LjEtMTEuNCwwLjItMTUuOGwyOS45LTMwLjZjNC4zLTQuNCwxMS4zLTQuNSwxNS41LTAuMmwyMDQuMiwyMTIuNyBjMi4yLDIuMiwzLjIsNS4yLDMsOC4xYzAuMSwzLTAuOSw1LjktMyw4LjFMMTc2LjcsNDc2LjhjLTQuMiw0LjMtMTEuMiw0LjItMTUuNS0wLjJMMTMxLjMsNDQ2Yy00LjMtNC40LTQuNC0xMS41LTAuMi0xNS44IEwyOTguMywyNTZ6XCIvPjwvc3ZnPidcbiAgICB9KSxcbiAgICBvcmJDb250cm9scyA9ICQoXCI8ZGl2IC8+XCIsIHsgXCJjbGFzc1wiOiBcIm9yYml0LWNvbnRyb2xzXCIgfSksICAgIFxuICAgIG9yYkJ1bGxldENvbnRhaW5lciA9ICQoXCI8bmF2IC8+XCIsIHtcbiAgICAgIFwiY2xhc3NcIjogYnVsbGV0Qm94ICsgXCIgb3JiaXQtYnVsbGV0c1wiLFxuICAgICAgXCJodG1sXCIgOiBvcmJCdWxsZXRNYXJrdXAob3JiQ29udGFpbmVyLCBzbGlkZUNsYXNzKVxuICAgIH0pOyAgICBcbiAgICBpZiAob3JiU2xpZGVzLmxlbmd0aDwxKXsgXG4gICAgICByZXR1cm47XG4gICAgfSAgICBcbiAgICBpZiAoYXV0b21hdGVOYXY9PVwidHJ1ZVwiKXsgICAgICBcbiAgICAgIGlmICh1c2VPdmVybGF5IHx8IHVzZUJ1dHRvbnM9PVwidHJ1ZVwiIHx8IHVzZUJ1bGxldHM9PVwidHJ1ZVwiKXtcbiAgICAgICAgaWYoYnV0dG9uUGFyZW50Q2xhc3M9PSdvcmJpdCcpe1xuICAgICAgICAgIG9yYi5hcHBlbmQob3JiQ29udHJvbHMpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYob3JiLmZpbmQoJy4nK2J1dHRvblBhcmVudENsYXNzKS5sZW5ndGg+MCl7XG4gICAgICAgICAgb3JiLmZpbmQoJy4nK2J1dHRvblBhcmVudENsYXNzKyc6Zmlyc3QnKS5hcHBlbmQob3JiQ29udHJvbHMpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAodXNlQnVsbGV0cz09XCJ0cnVlXCIpIHsgICBcbiAgICAgICAgaWYodXNlT3ZlcmxheSAmJiBvcmIuZmluZCgnLm9yYml0LWNvbnRyb2xzJykubGVuZ3RoKXtcbiAgICAgICAgICBvcmIuZmluZCgnLm9yYml0LWNvbnRyb2xzJykuZXEoMCkuYXBwZW5kKG9yYkJ1bGxldENvbnRhaW5lcik7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgb3JiLmFwcGVuZChvcmJCdWxsZXRDb250YWluZXIpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZih1c2VCdXR0b25zPT1cInRydWVcIikgeyBcbiAgICAgICAgb3JiLmZpbmQoJy5vcmJpdC1jb250cm9scycpLmVxKDApLnByZXBlbmQoYnRuUHJldikuYXBwZW5kKGJ0bk5leHQpOyAgICAgIFxuICAgICAgfVxuICAgIH1cbiAgICBpZiAob3JiU2xpZGVzLmZpbHRlcignLmlzLWFjdGl2ZScpLmxlbmd0aDwxKXsgXG4gICAgICAgIG9yYlNsaWRlcy5lcSgwKS5hZGRDbGFzcygnaXMtYWN0aXZlJyk7XG4gICAgfVxuICAgIGFjdGl2ZVNsaWRlID0gb3JiU2xpZGVzLmZpbHRlcignLmlzLWFjdGl2ZScpLmluZGV4KCk7XG4gICAgb3JiLmZpbmQoJy5vcmJpdC1idWxsZXRzJykuY2hpbGRyZW4oJ2J1dHRvbicpLmVxKGFjdGl2ZVNsaWRlKS5hZGRDbGFzcygnaXMtYWN0aXZlJyk7XG4gIH0pO1xufVxuXG5pZigkKFwiLm9yYml0XCIpLmxlbmd0aCl7IFxuICBwcmVPcmJpdCgpO1xuICB2YXIgb3JiaXRUaW1lcj0wO1xuICAkKHdpbmRvdykub24oJ3Jlc2l6ZScsIGZ1bmN0aW9uKCkgeyAgIFxuICAgIGNsZWFyVGltZW91dChvcmJpdFRpbWVyKTtcbiAgICBvcmJpdFRpbWVyID0gc2V0VGltZW91dChyZWNhbGNPcmJpdCwgMzAwKTsgIFxuICB9KTsgIFxufVxuIiwiXG4vLyBoaWdobGlnaHQgYW5kIGNvbGxhcHNlIG5hdiB0ZXJ0aWFyeSBzZWN0aW9uc1xuXG5mdW5jdGlvbiB0ZXJ0aWFyeU5hdigpe1xuICB2YXIgJG5hdkxpc3QgPSAkKCcudGVydGlhcnktbmF2JykuZmluZCgndWw6Zmlyc3QnKSB8fCAnJyxcbiAgJG5hdkxpbmtzID0gJG5hdkxpc3QuZmluZCgnYScpLFxuICBwID0gbG9jYXRpb24ucGF0aG5hbWUubWF0Y2goL1xcLyQvKSA/IGxvY2F0aW9uLnBhdGhuYW1lICsgXCJpbmRleC5cIiA6IGxvY2F0aW9uLnBhdGhuYW1lLCBcbiAgaD0nJztcbiAgJG5hdkxpc3QuZmluZCgndWwnKS5hZGRDbGFzcygnaGlkZScpO1xuICAkbmF2TGlua3MuZWFjaChmdW5jdGlvbigpe1xuICAgIGggPSAkKHRoaXMpLmF0dHIoJ2hyZWYnKS5tYXRjaCgvXFwvJC8pID8gJCh0aGlzKS5hdHRyKCdocmVmJykgKyBcImluZGV4LlwiIDogJCh0aGlzKS5hdHRyKCdocmVmJyk7XG4gICAgaWYoaCAhPT0gcCkgeyByZXR1cm47IH1cbiAgICAkKHRoaXMpLmFkZENsYXNzKCdhY3RpdmUnKS5wYXJlbnRzKCdsaScpLmFkZENsYXNzKCdwYXJlbnQnKTsgIFxuICAgICQodGhpcykuY2xvc2VzdCgndWwuaGlkZScpLnJlbW92ZUNsYXNzKCdoaWRlJykucGFyZW50KCdsaScpLmFkZENsYXNzKCdkYXRhLWV4cGFuZGVkJyk7XG4gICAgaWYoJCh0aGlzKS5zaWJsaW5ncygndWwnKS5sZW5ndGgpIHsgICAgICAgXG4gICAgICAkKHRoaXMpLnNpYmxpbmdzKCd1bCcpLnJlbW92ZUNsYXNzKCdoaWRlJyk7XG4gICAgICAkKHRoaXMpLmNsb3Nlc3QoJ2xpJykuYWRkQ2xhc3MoJ2RhdGEtZXhwYW5kZWQnKTsgXG4gICAgfVxuICB9KTtcbn1cblxuaWYgKCQoXCIudGVydGlhcnktbmF2XCIpLmxlbmd0aCkge3RlcnRpYXJ5TmF2KCk7fVxuIiwiZnVuY3Rpb24gZ2V0V2lkdGgoKXtcbiAgdmFyIHcgPSB3aW5kb3cuaW5uZXJXaWR0aCB8fCBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50V2lkdGggfHwgZG9jdW1lbnQuYm9keS5jbGllbnRXaWR0aDsgXG4gIHJldHVybiB3O1xufSBcbkZvdW5kYXRpb24uQWNjb3JkaW9uLmRlZmF1bHRzLm11bHRpRXhwYW5kID0gdHJ1ZTtcbkZvdW5kYXRpb24uQWNjb3JkaW9uLmRlZmF1bHRzLmFsbG93QWxsQ2xvc2VkID0gdHJ1ZTtcbi8vRm91bmRhdGlvbi5BY2NvcmRpb24uZGVmYXVsdHMuZGVlcExpbmsgPSB0cnVlO1xuLy9Gb3VuZGF0aW9uLkFjY29yZGlvbi5kZWZhdWx0cy51cGRhdGVIaXN0b3J5ID0gdHJ1ZTtcbi8vRm91bmRhdGlvbi5BY2NvcmRpb24uZGVmYXVsdHMuZGVlcExpbmtTbXVkZ2UgPSB0cnVlO1xuRm91bmRhdGlvbi5SZXZlYWwuZGVmYXVsdHMuZGVlcExpbmsgPSB0cnVlO1xuRm91bmRhdGlvbi5SZXZlYWwuZGVmYXVsdHMuZnVsbFNjcmVlbiA9IGZhbHNlO1xuRm91bmRhdGlvbi5SZXZlYWwuZGVmYXVsdHMucmVzZXRPbkNsb3NlID0gdHJ1ZTtcbkZvdW5kYXRpb24uUmV2ZWFsLmRlZmF1bHRzLnVwZGF0ZUhpc3RvcnkgPSB0cnVlO1xuRm91bmRhdGlvbi5SZXZlYWwuZGVmYXVsdHMudk9mZnNldCA9IDA7XG4vLyBSZXZlYWwgY2xvc2VPbkVzYyBhbmQgY2xvc2VPbkNsaWNrIGFyZSBib3RoIHRydWUgXG4vLyBkaXNhYmxpbmcgZGVlcGxpbmsgYW5kIHVwZGF0ZSBoaXN0b3J5IHRvIHByZXZlbnQgYnVnIHdoZXJlIG90aGVyIGJvb2ttYXJrcyBpbiB1cmwgZGlzYWJsZSBhbGwgYWN0aXZlIHRhYnNcbi8vRm91bmRhdGlvbi5UYWJzLmRlZmF1bHRzLmRlZXBMaW5rID0gdHJ1ZTtcbi8vRm91bmRhdGlvbi5UYWJzLmRlZmF1bHRzLnVwZGF0ZUhpc3RvcnkgPSB0cnVlO1xuLy9Gb3VuZGF0aW9uLlRhYnMuZGVmYXVsdHMuZGVlcExpbmtTbXVkZ2UgPSB0cnVlOyBcbmlmIChnZXRXaWR0aCgpID4gNTY5KSB7IFxuICBGb3VuZGF0aW9uLlRhYnMuZGVmYXVsdHMubWF0Y2hIZWlnaHQgPSB0cnVlO1xufVxuRm91bmRhdGlvbi5BYmlkZS5kZWZhdWx0cy5wYXR0ZXJuc1snZGlnaXRzX2Rhc2hlcyddID0gL15bMC05LV0qJC87XG5Gb3VuZGF0aW9uLkFiaWRlLmRlZmF1bHRzLnBhdHRlcm5zWydkaWdpdHNfc2xhc2hlcyddID0gL15bMC05XFwvXSokLztcbkZvdW5kYXRpb24uQWJpZGUuZGVmYXVsdHMucGF0dGVybnNbJ1lZc2xhc2hNTSddID0gL15cXGR7Mn1cXC8oMFsxLTldfDFbMC0yXSkkLztcbkZvdW5kYXRpb24uQWJpZGUuZGVmYXVsdHMucGF0dGVybnNbJ3RlbCddID0gL15cXCg/XFxkezN9XFwpP1tcXHMrfC1dP1xcZHszfVtcXHMrfC1dP1xcZHs0fS87XG5Gb3VuZGF0aW9uLkFiaWRlLmRlZmF1bHRzLnBhdHRlcm5zWydzc24nXSA9IC9eWzAtOV17NH0kLztcbkZvdW5kYXRpb24uQWJpZGUuZGVmYXVsdHMucGF0dGVybnNbJ2FscGhhLW51bS1oeXBoZW4nXSA9IC9eWy1BLVphLXowLTkgXSskLztcbkZvdW5kYXRpb24uQWJpZGUuZGVmYXVsdHMucGF0dGVybnNbJ25vLXVuc2FmZSddID0gL15bXlxcW1xcXXt9PD4jJV4qXys9fFxcXFwvfmBdKyQvO1xuRm91bmRhdGlvbi5BYmlkZS5kZWZhdWx0c1sndmFsaWRhdG9ycyddWydjaGVja2VkX3JlcXVpcmVkJ10gPVxuICBmdW5jdGlvbiAoJGVsLCByZXF1aXJlZCwgcGFyZW50KSB7XG4gICAgdmFyIGdyb3VwID0gcGFyZW50LmNsb3Nlc3QoJy5jaGVja2VkLWdyb3VwJyk7XG4gICAgdmFyIG1pbiA9IGdyb3VwLmF0dHIoJ2RhdGEtdmFsaWRhdG9yLWFiaWRlLW1pbicpIHx8IDE7XG4gICAgdmFyIG1heCA9IGdyb3VwLmF0dHIoJ2RhdGEtdmFsaWRhdG9yLWFiaWRlLW1heCcpIHx8IDk5OTk7XG4gICAgdmFyIGNoZWNrZWQgPSBncm91cC5maW5kKCc6Y2hlY2tlZCcpLmxlbmd0aDtcbiAgICBpZiAoY2hlY2tlZCA+PSBtaW4gICYmIGNoZWNrZWQgPD0gbWF4KSB7XG4gICAgICBncm91cC5maW5kKCdsYWJlbCcpLmZpbHRlcignLmlzLWludmFsaWQtbGFiZWwnKS5yZW1vdmVDbGFzcygnaXMtaW52YWxpZC1sYWJlbCcpO1xuICAgICAgZ3JvdXAuZmluZCgnW2RhdGEtYWJpZGUtZXJyb3JdJykuaGlkZSgpOyAgIFxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIGdyb3VwLmZpbmQoJ2xhYmVsJykuZWFjaChmdW5jdGlvbigpIHsgJCh0aGlzKS5hZGRDbGFzcygnaXMtaW52YWxpZC1sYWJlbCcpOyB9KTtcbiAgICAgIGdyb3VwLmZpbmQoJ1tkYXRhLWFiaWRlLWVycm9yXScpLmNzcyh7IGRpc3BsYXk6ICdibG9jaycgfSk7XG4gICAgICBncm91cC5maW5kKCdbZGF0YS12YWxpZGF0b3I9XCJjaGVja2VkX3JlcXVpcmVkXCJdJykuc2libGluZ3MoJ2xhYmVsJykuYWRkQmFjaygpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7IFxuICAgICAgICBncm91cC5maW5kKCdbZGF0YS1hYmlkZS1lcnJvcl0nKS5oaWRlKCkuZW5kKCkuZmluZCgnbGFiZWwnKS5maWx0ZXIoJy5pcy1pbnZhbGlkLWxhYmVsJykucmVtb3ZlQ2xhc3MoJ2lzLWludmFsaWQtbGFiZWwnKTtcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfTtcblxuJChkb2N1bWVudCkuZm91bmRhdGlvbigpOyBcbiIsInZhciBzaGFyZUxpbmtEZWNvZGUgPSBmdW5jdGlvbih2YWx1ZSl7XG4gICAgcmV0dXJuICQoXCI8ZGl2Lz5cIikuaHRtbCh2YWx1ZSkudGV4dCgpO1xuICB9LFxuICBzaGFyZUxpbmtVcGRhdGUxID0gZnVuY3Rpb24oKXtcbiAgdmFyIHdpblByb3BzID0gJ2NoYW5uZWxtb2RlPW5vLGRpcmVjdG9yaWVzPW5vLGZ1bGxzY3JlZW49bm8sbG9jYXRpb249bm8sc3RhdHVzPW5vLHRvb2xiYXI9bm8sbW9kYWw9eWVzLGFsd2F5c1JhaXNlZD15ZXMscmVzaXphYmxlPXllcycsXG4gICAgICBsbmsgPSBlbmNvZGVVUklDb21wb25lbnQobG9jYXRpb24pLFxuICAgICAgZHRsbmsgPSAgJCgnLnNoYXJlbGluay10d2l0dGVyJykubGVuZ3RoICYmICQoJy5zaGFyZWxpbmstdHdpdHRlcicpWzBdLmhhc0F0dHJpYnV0ZSgnZGF0YS1sb2NhdGlvbicpID8gJCgnLnNoYXJlbGluay10d2l0dGVyJykuYXR0cignZGF0YS1sb2NhdGlvbicpIDogbG5rLFxuICAgICAgdGl0bGUxPSAkKCdtZXRhW3Byb3BlcnR5PVwib2c6dGl0bGVcIl0nKS5sZW5ndGggJiYgJCgnbWV0YVtwcm9wZXJ0eT1cIm9nOnRpdGxlXCJdOmZpcnN0JykuYXR0cignY29udGVudCcpLmxlbmd0aCA/ICQoJ21ldGFbcHJvcGVydHk9XCJvZzp0aXRsZVwiXTpmaXJzdCcpLmF0dHIoJ2NvbnRlbnQnKSA6ICQoJ2gxOmZpcnN0JykudGV4dCgpLmxlbmd0aCA/ICQoJ2gxOmZpcnN0JykudGV4dCgpIDogZG9jdW1lbnQudGl0bGUubGVuZ3RoID8gZG9jdW1lbnQudGl0bGUgOiAnJyxcbiAgICAgIHRpdGxlID0gZW5jb2RlVVJJQ29tcG9uZW50KHNoYXJlTGlua0RlY29kZSh0aXRsZTEpKSxcbiAgICAgIGltZyA9ICQoJ21ldGFbcHJvcGVydHk9XCJvZzppbWFnZVwiXScpLmxlbmd0aCAmJiAkKCdtZXRhW3Byb3BlcnR5PVwib2c6aW1hZ2VcIl06Zmlyc3QnKS5hdHRyKCdjb250ZW50JykubGVuZ3RoID8gJCgnbWV0YVtwcm9wZXJ0eT1cIm9nOmltYWdlXCJdOmZpcnN0JykuYXR0cignY29udGVudCcpIDogJycsXG4gICAgICBzdW0xID0gJCgnbWV0YVtwcm9wZXJ0eT1cIm9nOmRlc2NyaXB0aW9uXCJdJykubGVuZ3RoICYmICQoJ21ldGFbcHJvcGVydHk9XCJvZzpkZXNjcmlwdGlvblwiXTpmaXJzdCcpLmF0dHIoJ2NvbnRlbnQnKS5sZW5ndGggPyBzaGFyZUxpbmtEZWNvZGUoJCgnbWV0YVtwcm9wZXJ0eT1cIm9nOmRlc2NyaXB0aW9uXCJdOmZpcnN0JykuYXR0cignY29udGVudCcpKSA6ICcnLFxuICAgICAgc3VtMiA9ICQoJ21ldGFbbmFtZT1cImFic3RyYWN0XCJdJykubGVuZ3RoICYmICQoJ21ldGFbbmFtZT1cImFic3RyYWN0XCJdOmZpcnN0JykuYXR0cignY29udGVudCcpLmxlbmd0aCA/IHNoYXJlTGlua0RlY29kZSgkKCdtZXRhW25hbWU9XCJhYnN0cmFjdFwiXTpmaXJzdCcpLmF0dHIoJ2NvbnRlbnQnKSkgOiAnJyxcbiAgICAgIHN1bW1hcnkgPSBzdW0xLmxlbmd0aCA+IDUgPyBlbmNvZGVVUklDb21wb25lbnQoc3VtMSkgOiBzdW0yLmxlbmd0aCA+IDUgPyBlbmNvZGVVUklDb21wb25lbnQoc3VtMikgOiAnJyxcbiAgICAgIGZibGluayA9ICdodHRwczovL3d3dy5mYWNlYm9vay5jb20vc2hhcmVyL3NoYXJlci5waHA/dT0nK2xuayxcbiAgICAgIGxpbGluayA9ICdodHRwczovL3d3dy5saW5rZWRpbi5jb20vc2hhcmVBcnRpY2xlP21pbmk9dHJ1ZSZ1cmw9JytsbmsrJyZ0aXRsZT0nK3RpdGxlKycmc291cmNlPScrbG5rKycmc3VtbWFyeT0nK3N1bW1hcnksXG4gICAgICBtdGxpbmsgPSAnbWFpbHRvOj9ib2R5PVlvdSUyMG1pZ2h0JTIwYmUlMjBpbnRlcmVzdGVkJTIwaW4lMjB0aGlzJTIwYXJ0aWNsZSUyMGJ5JTIwRnJlZGRpZSUyME1hYy4lMjAnK3RpdGxlKyc6JTIwJytzdW1tYXJ5KyclMjAnK2xuaysnJlN1YmplY3Q9Jyt0aXRsZSxcbiAgICAgIHR3bGluayA9ICdodHRwczovL3R3aXR0ZXIuY29tL2ludGVudC90d2VldC8/dGV4dD0nK3RpdGxlKycmdXJsPScrZHRsbmsrJyZ2aWE9ZnJlZGRpZW1hYyc7XG5cbiAgJCgnLnNoYXJlbGluay1tYWlsdG8nKS5lYWNoKGZ1bmN0aW9uKCl7XG4gICAgJCh0aGlzKS5hdHRyKCdocmVmJyxtdGxpbmspOyBcbiAgfSk7XG4gICQoJy5zaGFyZWxpbmstZmFjZWJvb2snKS5lYWNoKGZ1bmN0aW9uKCl7IFxuICAgICQodGhpcykuYXR0cignaHJlZicsICdqYXZhc2NyaXB0OnZvaWQoMCk7Jykub24oJ2NsaWNrJywgZnVuY3Rpb24oZSl7IFxuICAgICAgdmFyIHNoYXJlcl9tb2RhbCA9IHdpbmRvdy5vcGVuKGZibGluaywgXCJfYmxhbmtcIiwgd2luUHJvcHMgKyAnLHdpZHRoPTYwMCxoZWlnaHQ9NTAwJywgdHJ1ZSk7IFxuICAgICAgc2hhcmVyX21vZGFsLm9wZW5lcj1udWxsO1xuICAgIH0pO1x0XG4gIH0pO1xuICAkKCcuc2hhcmVsaW5rLWxpbmtlZGluJykuZWFjaChmdW5jdGlvbigpeyBcbiAgICAkKHRoaXMpLmF0dHIoJ2hyZWYnLCAnamF2YXNjcmlwdDp2b2lkKDApOycpLm9uKCdjbGljaycsIGZ1bmN0aW9uKGUpeyAgXG4gICAgICB2YXIgc2hhcmVyX21vZGFsID0gd2luZG93Lm9wZW4obGlsaW5rLCBcIl9ibGFua1wiLCB3aW5Qcm9wcyArICcsd2lkdGg9ODAwLGhlaWdodD02MDAnLCB0cnVlKTsgXG4gICAgICBzaGFyZXJfbW9kYWwub3BlbmVyPW51bGw7XG4gICAgfSk7XHRcbiAgfSk7XG4gICQoJy5zaGFyZWxpbmstdHdpdHRlcicpLmVhY2goZnVuY3Rpb24oKXsgXG4gICAgJCh0aGlzKS5hdHRyKCdocmVmJywgJ2phdmFzY3JpcHQ6dm9pZCgwKTsnKS5vbignY2xpY2snLCBmdW5jdGlvbihlKXsgXG4gICAgICB2YXIgc2hhcmVyX21vZGFsID0gd2luZG93Lm9wZW4odHdsaW5rLCBcIl9ibGFua1wiLCB3aW5Qcm9wcyArICcsd2lkdGg9NTAwLGhlaWdodD01MDAnLCB0cnVlKTsgXG4gICAgICBzaGFyZXJfbW9kYWwub3BlbmVyPW51bGw7XG4gICAgfSk7XG4gIH0pO1x0XG59O1xuXG4kKGZ1bmN0aW9uKCl7ICBcbiAgJChcIi5zaGFyZS13cmFwcGVyXCIpLmZpbHRlcignLmhpZGUnKS5lYWNoKGZ1bmN0aW9uKCl7XG4gICAgJChcIi5zaGFyZS13cmFwcGVyXCIpLnJlbW92ZUNsYXNzKCdoaWRlJyk7XG4gIH0pO1xuICBpZigkKFwiLnNoYXJlLXdpZGdldFwiKS5sZW5ndGgpeyBzaGFyZUxpbmtVcGRhdGUxKCk7IH1cbn0pO1xuIl19
