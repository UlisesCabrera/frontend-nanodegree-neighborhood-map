$(function() {
  $('.toggle-menu').click(function() {
    $('.off-canvas-menu').toggleClass('open');
    $('.outsideBtn').toggleClass('visible');
    menuTextToggler();
  });
});

function menuTextToggler() {
  if($('.off-canvas-menu').hasClass('open')){
    $('.toggle-menu span').text(' Hide Menu');
  } else {
    $('.toggle-menu span').text(' Show Menu');
  }
}