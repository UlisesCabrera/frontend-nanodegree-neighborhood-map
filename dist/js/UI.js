function menuTextToggler(){$(".toggle-menu span").text($(".off-canvas-menu").hasClass("open")?" Hide Menu":" Show Menu")}function menuToggler(){$(".off-canvas-menu").toggleClass("open"),$(".outsideBtn").toggleClass("visible")}function externalToggler(){$(".toggle-external").toggleClass("open")}function closeExternalToggler(){$(".toggle-external").removeClass("open")}function externalContainer(){$(".off-canvas-external-resources").toggleClass("open")}$(function(){$(".toggle-menu").click(function(){menuToggler(),menuTextToggler()}),$(".toggle-menu.outsideBtn").click(function(){closeExternalToggler(),$(".off-canvas-external-resources").hasClass("open")&&externalContainer()}),$(".listPlaces").on("click","li",function(){menuToggler(),menuTextToggler(),externalToggler()}),$(".toggle-external").on("click",function(){externalContainer(),externalToggler()}),$(".close-button").on("click","img",function(){externalContainer(),externalToggler()})});