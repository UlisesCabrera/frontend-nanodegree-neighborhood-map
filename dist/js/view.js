function menuTextToggler(){$(".toggle-menu span").text($(".off-canvas-menu").hasClass("open")?" Close Menu":" Open Menu")}$(function(){$(".toggle-menu").click(function(){$(".off-canvas-menu").toggleClass("open"),menuTextToggler()})});