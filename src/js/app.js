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
  		// start nearby search request
		var request = {
    		location: nHood(),
    		radius: '500',
    		types: ['store']
  		};
	    var service = new google.maps.places.PlacesService(map());
		service.nearbySearch(request, callback);
		//end nearby search request
		
		//place markers from the result of the nearby search		
		function callback(results, status) {
		  if (status == google.maps.places.PlacesServiceStatus.OK) {
		    for (var i = 0; i < results.length; i++) {
		      var place = results[i];
			  // send results out of the function to the root object
			  model.places.push(place);
			  var placeId = results[i].place_id;
		      createMarker(results[i]);
		    }
		  }
		}
		
		// create markers function from the results of the search
		function createMarker(place) {
		  var placeLoc = place.geometry.location;
		  // get photos if they are avaiable
		  var photos = (!place.photos) ? 'images/sample.jpg' : place.photos[0].getUrl({'maxWidth': 200, 'maxHeight': 200});
		  var marker = new google.maps.Marker({
		    map: map(),
		    position: placeLoc,
			title: place.name,
		  });
		  // create info window
		  var infowindow = new google.maps.InfoWindow({
			 content : '<h4 class="text-center">' + place.name + '</h4>' + '<img src="'+ photos +'" class="img-responsive">'
		  });
	  	  // add event listener to the map, when click opens up the info window
		  google.maps.event.addListener(marker, 'click', function() {
	   		infowindow.open(map(), this);
	  		});		  		  			  				
		}
		
		// search box start
		// get input element
		var input = document.getElementById('search');	
		// set bounds
		var bounds = new google.maps.LatLngBounds(
			  new google.maps.LatLng(40.8621822, -73.8935974),
  			  new google.maps.LatLng(40.8621822, -73.8935974));
				
		// set search box
		var searchBox = new google.maps.places.SearchBox(input, {
  			bounds: bounds
		});
				
		// grab user input from search box and place a marker in the map					
 		 google.maps.event.addListener(searchBox, 'places_changed', function() {
    		var place = searchBox.getPlaces();
			//add places to the list
			model.places.push(place[0]);
			console.log(place);
    		if (place.length == 0) {
      		return;
			};
			createMarker(place[0]);		  
		 });
		// search box end		
		
		//save the map object on the model map property
		model.map = map();	
	},
	// empty string which will hold the results from the nearbySearch
	places : ko.observableArray([]),
	//entry string to hold map object
	map : ko.observable()
};

var ViewModel = function() {
	var self = this;
	self.map = ko.observable(model.init());
	self.places = ko.computed(function(){
		return model.places();
	})
};
	
ko.applyBindings(new ViewModel());