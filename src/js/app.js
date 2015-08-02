var model = {
	init: function(){
		$('body').append('<script type="text/javascript" src="https://maps.googleapis.com/maps/api/js?key=AIzaSyD-ea-0b-EOXWC6svLpOyxcBKs3ecfe1co&callback=model.loadMap">');	
	},
	loadMap : function (){
		var mapOptions = {
  			center: { lat:40.8621822, lng:-73.8935974},
  			zoom: 18
		 };
		var map = new google.maps.Map(document.getElementById('mapCanvas') , mapOptions);			
	}	
};
	
var ViewModel = function() {
	var self = this;
	self.map = ko.observable(model.init());
};
	
ko.applyBindings(new ViewModel());