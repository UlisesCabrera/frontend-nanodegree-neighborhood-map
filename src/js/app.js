var model = {
	init: function(){
		//append map api script to the html file
		$('body').append('<script type="text/javascript" src="https://maps.googleapis.com/maps/api/js?libraries=places&signed_in=true&key=AIzaSyD-ea-0b-EOXWC6svLpOyxcBKs3ecfe1co&callback=model.loadMap">');	
	},
		// loads the map
	loadMap : function () {
		var lat = ko.observable(40.8621822);
		var lng = ko.observable(-73.8935974);
		var nHood = ko.observable(new google.maps.LatLng(lat(), lng()));
		var map = ko.observable(new google.maps.Map(document.getElementById('mapCanvas'), {
			center: nHood(),
  			zoom: 17
		}));
  		var request = {
    		location: nHood(),
    		radius: '500',
    		types: ['store']
  		};
 		var infowindow = new google.maps.InfoWindow();
	    var service = new google.maps.places.PlacesService(map());
		service.nearbySearch(request, callback);
		
		function callback(results, status) {
		  if (status == google.maps.places.PlacesServiceStatus.OK) {
		    for (var i = 0; i < results.length; i++) {
		      var place = results[i];
			  // send results out of the function to the root object
			  model.place.push(place);
			  var placeId = results[i].place_id;
		      createMarker(results[i]);
		    }
		  }
		}
		function createMarker(place) {
		  var placeLoc = place.geometry.location;
		  var marker = new google.maps.Marker({
		    map: map(),
		    position: place.geometry.location
		  });
	  	  google.maps.event.addListener(marker, 'click', function() {
	      	infowindow.setContent(place.name);
	   		infowindow.open(map(), this);
	  		});		  		  			  				
		}	
	},
	// empty string which will hold the results from the nearbySearch
	place :ko.observableArray([])
};

var ViewModel = function() {
	var self = this;
	self.map = ko.observable(model.init());
};
	
ko.applyBindings(new ViewModel());