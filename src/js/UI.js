/// <reference path="../../typings/jquery/jquery.d.ts"/>
$(function () {
  /*
  Setting the event listeners for each button
 */

  $('.inside-main-menu-btn').on('click', function () {
    menuToggler();
    menuTextToggler();
  });

  $('.inside-main-menu-arw').on('click', function () {
    menuToggler();
    menuTextToggler();
  });

  $('.outside-main-menu-btn').on('click', function () {
    menuToggler();
    menuTextToggler();
    closeMoreInfoToggler();
  });

  $('.list-of-places').on('click', 'li', function () {
    menuToggler();
    menuTextToggler();
    moreInfoToggler();
  });

  $('.close-more-info-btn').on('click', 'img', function () {
    $('#more-info-modal').modal('hide')
  })
});

/*
  Set of functions that will handle all the buttons
 */
function menuTextToggler() {
  if ($('.off-canvas-main-menu').hasClass('open')) {
    $('.outside-main-menu-btn span').text(' Hide menu');
    $('.inside-main-menu-btn span').text(' Hide menu');
  } else {
    $('.outside-main-menu-btn span').text(' Show menu');
    $('.inside-main-menu-btn span').text(' Show menu');
  }
}

function menuToggler() {
  $('.off-canvas-main-menu').toggleClass('open');
  $('.outside-main-menu-btn').toggleClass('visible');
}

function moreInfoToggler() {
  if ($('.open-more-info-btn').hasClass('visible')) {

  } else {
    $('.open-more-info-btn').toggleClass('visible');
  }
}

function closeMoreInfoToggler() {
  $('.open-more-info-btn').removeClass('visible');
}