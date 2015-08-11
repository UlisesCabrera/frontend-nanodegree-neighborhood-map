/// <reference path="../../typings/jquery/jquery.d.ts"/>
$(function() {
  /*
  Setting the event listeners for each button
 */
  $('.toggle-menu').click(function() {
    menuToggler();
    menuTextToggler();
  });
  
  $('.toggle-menu.outsideBtn').click(function() {
    closeExternalToggler();
    if($('.off-canvas-external-resources').hasClass('open')){
      externalContainer();
    }
  });
  
  $('.listPlaces').on('click','li', function(){
    menuToggler();
    menuTextToggler();
    externalToggler();
  });
  
  $('.toggle-external').on('click', function(){
    externalContainer();
    externalToggler();
  });
  
  $('.close-button').on('click','img', function(){
    externalContainer();
    externalToggler();
  })
});


/*
  Set of functions that will handle all the buttons
 */
function menuTextToggler() {
  if($('.off-canvas-menu').hasClass('open')){
    $('.toggle-menu span').text(' Hide Menu');
  } else {
    $('.toggle-menu span').text(' Show Menu');
  }
}

function menuToggler() {
    $('.off-canvas-menu').toggleClass('open');
    $('.outsideBtn').toggleClass('visible');
}

function externalToggler() {
    $('.toggle-external').toggleClass('open');
}

function closeExternalToggler() {
  $('.toggle-external').removeClass('open');
}

function externalContainer(){
  $('.off-canvas-external-resources').toggleClass('open');
}