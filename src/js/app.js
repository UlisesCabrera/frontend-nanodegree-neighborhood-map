
   var model = {
			init : function() {
			
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
		self.map = ko.observable(model.loadMap());
	};
	
	ko.applyBindings(new ViewModel());