//setting global variables that will be used accross the app
var map, model;

var Model = function() {
	self =  this;
	self.lat = ko.observable(40.8621822);
	self.lng = ko.observable(-73.8935974);
	self.neighborhood = ko.observable(new google.maps.LatLng(self.lat(), self.lng())),
	self.mapOptions = ko.observable({
		center : self.neighborhood(),
		zoom: 15
	});
	// get nearby search request
	self.request = ko.observable({
		location: self.neighborhood(),
    	radius: '500',
    	types: ['store']
	});
	self.service = new google.maps.places.PlacesService(map);
	self.service.nearbySearch(self.request(), function(results, status){
		//place markers from the result of the nearby search
		if (status == google.maps.places.PlacesServiceStatus.OK) {
		    for (var i = 0; i < results.length; i++) {
		      var place = results[i];
			  // send results out of the function to the viewModel object
			  vm.places.push(place);
		      //call function of the viewModel to create markers based on the results
		      vm.createMarkers(results[i]);
		    }
		  }

	});
	//end nearby search request

	// create markers function from the results of the search
};

var ViewModel = function() {
	var self = this;
	// function that gets call when the script is loaded.
	// loads the map
	self.placeMap = function() {
		map = new google.maps.Map(document.getElementById('mapCanvas'));
		// create a new model object and set it to the global scope
		model = ko.observable(new Model());
		// set options after it got access to the model data
		map.setOptions(model().mapOptions());
	};		

	self.getMap = function(){
		$('body').append('<script type="text/javascript" src="https://maps.googleapis.com/maps/api/js?libraries=places&signed_in=true&key=AIzaSyD-ea-0b-EOXWC6svLpOyxcBKs3ecfe1co&callback=vm.placeMap">');
	};
	
	self.createMarkers = function(place) {
		var placeLoc = place.geometry.location;
		  // get photos if they are avaiable
		var photos = (!place.photos) ? 'images/sample.jpg' : place.photos[0].getUrl({'maxWidth': 200, 'maxHeight': 200});
		var infowindow = new google.maps.InfoWindow({
			  content : '<h4 class="text-center">' + place.name + '</h4>' + '<img src="'+ photos +'" class="img-responsive">'
		});

		var marker = new google.maps.Marker({
		    map: map,
		    position: placeLoc,
			title: place.name,
		});
		  
		google.maps.event.addListener(marker, 'click', function() {
	   		infowindow.open(map, this);
	  	});		  		  			  				
	};					
	//places will be pushed to this array from the results of the nearbySearch
	self.places = ko.observableArray([]);
	//calls the get map function
	self.getMap();

};
// assining view model to a variable to get access to its methods from the global scope
var vm = new ViewModel();	

ko.applyBindings(vm);