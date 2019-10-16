  function timelinenav(item,data){

    // active timeline item
    var target = document.getElementById(item);

    // nav menu item
    var thisnav = document.getElementById("nav-"+item);

    // remove active class from all others
    var timelinemenuitems = document.getElementsByClassName('timeline-menu-item'), i;
    for (var i = 0; i < timelinemenuitems.length; i ++) {
      if(timelinemenuitems[i].classList.contains('active')){
        timelinemenuitems[i].classList.remove('active');
      }
    }
    // add active to the hovered item
    thisnav.classList.add('active');


    // remove active from all timeline items
    var timelineitems = document.getElementsByClassName('timeline-item'), i;
    for (var i = 0; i < timelineitems.length; i ++) {
      if(timelineitems[i].classList.contains('active')){
        timelineitems[i].classList.remove('active');
      }
    }
    
    // add active to hovered timeline item
    target.classList.add('active');

    // 
    var scrolldiv = document.getElementById("timeline-outer");
    scrolldiv.scrollTop = target.offsetTop - scrolldiv.offsetTop;

    var timelinetexts = document.getElementsByClassName('timeline-text'), i;
    for (var i = 0; i < timelinetexts.length; i ++) {
      timelinetexts[i].style.display = 'none';
    }
    document.getElementById(data).style.display = 'block';
  }

  function timelinesubnav(nav, data, item){
    var navtarget = document.getElementById("nav-"+nav);
    var itemtarget = document.getElementById(item);
    // remove active class from all others
    var timelinemenuitems = document.getElementsByClassName('timeline-menu-item'), i;
    for (var i = 0; i < timelinemenuitems.length; i ++) {
      if(timelinemenuitems[i].classList.contains('active')){
        timelinemenuitems[i].classList.remove('active');
      }
    }
    // add active to the hovered item
    navtarget.classList.add('active');

  // remove active from all timeline items
    var timelineitems = document.getElementsByClassName('timeline-item'), i;
    for (var i = 0; i < timelineitems.length; i ++) {
      if(timelineitems[i].classList.contains('active')){
        timelineitems[i].classList.remove('active');
      }
    }
    
    // add active to hovered timeline item
    itemtarget.classList.add('active');

    // hide all timeline text
    var timelinetexts = document.getElementsByClassName('timeline-text'), i;

    for (var i = 0; i < timelinetexts.length; i ++) {
      timelinetexts[i].style.display = 'none';
    }

    // show the appropriate timeline text
    document.getElementById(data).style.display = 'block';
  }
