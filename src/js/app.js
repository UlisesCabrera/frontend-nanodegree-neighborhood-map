var map, neighborhood;

var model = {
	// loads the map
	loadMap : function () {
		neighborhood = ko.computed(function() {
			return new google.maps.LatLng(vm.lat(), vm.lng())
		});
		map = ko.observable(new google.maps.Map(document.getElementById('mapCanvas'), {
			  center: neighborhood(),
  			  zoom: 17
		}));
		
  		// start nearby search request
		var request = {
    		location: neighborhood(),
    		radius: '500',
    		types: ['store']
  		};
	    var service = new google.maps.places.PlacesService(map());
		service.nearbySearch(request, resultsHandler);
		
		// send results to the ViewModel	
		function resultsHandler(results, status) {
		  if (status == google.maps.places.PlacesServiceStatus.OK) {
		    for (var i = 0; i < results.length; i++) {	      
			  
			  vm.places.push(results[i]);
			  vm.createMarker(results[i]);

		    };
		  };
		}
	}
};

var ViewModel = function() {
	var self = this;
	self.lat = ko.observable(40.8621822);
	self.lng = ko.observable(-73.8935974);
	
	self.init = function() {
		var script = document.createElement('script');
		$(script).attr("type", "text/javascript");
		script.onerror = function(e){
			alert(e);
		};
		script.src = "https://maps.googleapis.com/maps/api/js?libraries=places&signed_in=true&key=AIzaSyD-ea-0b-EOXWC6svLpOyxcBKs3ecfe1co&callback=model.loadMap";
		$('body').append(script);
	};

	// empty array that will hold the results from the nearbySearch
	self.places = ko.observableArray([]);
	
	// empty array that will hold the markers
	self.markers = ko.observableArray([]);

	self.query = ko.observable('');
	//filtered arrays 
	self.search = ko.computed(function(){
    return ko.utils.arrayFilter(self.markers(), function(point){	
	  return point.title.toLowerCase().indexOf(self.query().toLowerCase()) >= 0;
   		});
  	});

  	// runs the setMarkers function each time the search array changes
  	self.search.subscribe(function(){
  		self.setMarkers();
  	});

	// create markers function from the results of the search
	self.createMarker = function(place) {
		  // get location from results
		  var placeLoc = place.geometry.location;
		  // get photos if they are avaiable
		  var photos = (!place.photos) ? 'images/sample.jpg' : place.photos[0].getUrl({'maxWidth': 200, 'maxHeight': 200});
		  // set initial markers based on the restults
		  var marker = new google.maps.Marker({
		    map: map(),
		    position: placeLoc,
			title: place.name
		  });
		  //create info window
		  var infowindow = new google.maps.InfoWindow({
			 content : '<h4 class="text-center">' + place.name + '</h4>' + '<img src="'+ photos +'" class="img-responsive">'
		  });
	  	  // add event listener to the map, when click opens up the info window
		  google.maps.event.addListener(marker, 'click', function() {
	   		infowindow.open(map(), this);
	  		});
		  //push markers to empty array
		  self.markers.push(marker);
		  }
	//deletes all the markers in the map
	self.deleteMarkers = function() {
		for (var i = 0; i < self.markers().length; i++){
			self.markers()[i].setMap(null);
		}
	}
	
	self.setMarkers = function() {
		/* 
		Deletes all the markers from map first,
		then check how many markers are in the search array
		and place them into the map,
		*/
		self.deleteMarkers();
		for (var i = 0; i < self.search().length; i++){
			self.search()[i].setMap(map());
		}
	};  		  		  
	self.init();
};

var vm = new ViewModel()
ko.applyBindings(vm);