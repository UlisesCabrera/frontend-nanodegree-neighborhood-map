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

	    var service = new google.maps.places.PlacesService(map());
		service.nearbySearch(request, callback);
		
		function callback(results, status) {
		  if (status == google.maps.places.PlacesServiceStatus.OK) {
		    for (var i = 0; i < results.length; i++) {
		      var place = results[i];
			  console.log(place);
			  // send results out of the function to the root object
			  model.places.push(place);
			  var placeId = results[i].place_id;
		      createMarker(results[i]);
		    }
		  }
		}
		function createMarker(place) {
		  var placeLoc = place.geometry.location;
		    var photos = (!place.photos) ? 'images/sample.jpg' : place.photos[0].getUrl({'maxWidth': 200, 'maxHeight': 200});
			console.log(photos);
		  var marker = new google.maps.Marker({
		    map: map(),
		    position: place.geometry.location,
			title: place.name,
		  });
		  var infowindow = new google.maps.InfoWindow({
			 content : '<h4 class="text-center">' + place.name + '</h4>' + '<img src="'+ photos +'" class="img-responsive">'
		  });
	  	  google.maps.event.addListener(marker, 'click', function() {
	   		infowindow.open(map(), this);
	  		});		  		  			  				
		}
		//save the map object on the model map property
		model.map = map();	
	},
	// empty string which will hold the results from the nearbySearch
	places :ko.observableArray([]),
	//entry string to hold map object
	map : ko.observable()
};

var ViewModel = function() {
	var self = this;
	self.model = {
		
	}
	self.init = {
		
	}
	self.map = ko.observable(model.init());
	self.places = ko.computed(function(){
		return model.places();
	})
};
	
ko.applyBindings(new ViewModel());