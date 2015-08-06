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
		
		//creates the infowindow object and sends it to the VM
		vm.infowindow(new google.maps.InfoWindow());

		// send results to the ViewModel	
		function resultsHandler(results, status) {
		  if (status == google.maps.places.PlacesServiceStatus.OK) {
		    for (var i = 0; i < results.length; i++) {	      
			  
			  vm.places.push(results[i]);
			  
			  //creates initial markers
			  vm.createMarker(results[i]);

		    };
		  };
		};
	}
};

var ViewModel = function() {
	var self = this;
	self.lat = ko.observable(40.8621822);
	self.lng = ko.observable(-73.8935974);
	
	//initiates the application by requesting the google map API
	self.init = function() {
		var script = document.createElement('script');
		$(script).attr("type", "text/javascript");
		script.onerror = function(e){
			alert(e);
		};
		script.src = "https://maps.googleapis.com/maps/api/js?libraries=places&signed_in=true&key=AIzaSyD-ea-0b-EOXWC6svLpOyxcBKs3ecfe1co&callback=model.loadMap";
		$('body').append(script);
	};

	self.infowindow = ko.observable();

	// empty array that will hold the results from the nearbySearch
	self.places = ko.observableArray([]);
	
	// empty array for the initial markers created
	self.markers = ko.observableArray([]);
	
	// filtered array 
	self.query = ko.observable('');
	self.search = ko.computed(function(){
    return ko.utils.arrayFilter(self.markers(), function(point){	
	  return point.title.toLowerCase().indexOf(self.query().toLowerCase()) >= 0;
   		});
  	});

  	// any time the filtered array changes, it set the currect markers on the map
  	self.search.subscribe(function(){
  		self.setMarkers();
  	});

	/*
		createMarkers function -  Creates initial markers, 
		sends a copy of each marker created to self.marker,
		sets the infowindow object to the global variable "infowindow", 
		check if there are photos available 
		and adds it to the content of the infowindow. 
		also, adds click event listener to open the info window of each marker.  
	*/
	self.createMarker = function(place) {
		  var placeLoc = place.geometry.location;
		  var photos = (!place.photos) ? 'images/sample.jpg' : place.photos[0].getUrl({'maxWidth': 200, 'maxHeight': 200});
		  var marker = new google.maps.Marker({
		    map: map(),
		    position: placeLoc,
		    animation: google.maps.Animation.DROP,
			title: place.name
		  });
	  	google.maps.event.addListener(marker, 'click', function() {
	  		    var infoOptions = {
				  	content : '<h4 class="text-center">' + marker.title + '</h4>'
				};
				self.infowindow().setOptions(infoOptions);
   				self.infowindow().open(map(), marker);
  		});				  
		
		self.markers.push(marker);
	};

	//deletes all the markers in the map
	self.deleteMarkers = function() {
		for (var i = 0; i < self.markers().length; i++){
			self.markers()[i].setMap(null);
		}
	};
	
	self.setMarkers = function() {
		/* 
		deletes all the markers from map first,
		then check how many markers are in the search array
		and place them into the map,
		*/
		self.deleteMarkers();
		for (var i = 0; i < self.search().length; i++){
			self.search()[i].setMap(map());
		}
	};

	self.highlightMarker = function(marker, event) {
	 	/* 
		make the clicked marker bounce for 7 seconds,
		if clicked again the bouncing will stop,
		opens up an info window with information about the current marker
		*/

		  if (marker.getAnimation() != null) {
		    marker.setAnimation(null);
		  } else {
		    marker.setAnimation(google.maps.Animation.BOUNCE);
		  }
		  
		  window.setTimeout(function(){
		  	marker.setAnimation(null);
		  }, 7000);

		  var infoOptions = {
		  	content : '<h4 class="text-center">' + marker.title + '</h4>'
		  };
		  self.infowindow().setOptions(infoOptions);
		  self.infowindow().open(map(), marker);
	};
  
	self.init();
};

var vm = new ViewModel()
ko.applyBindings(vm);