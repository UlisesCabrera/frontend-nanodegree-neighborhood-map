/// <reference path="../../typings/jquery/jquery.d.ts"/>
/// <reference path="../../typings/knockout/knockout.d.ts"/>
var map, neighborhood;

var model = {
    // loads the map
    loadMap: function () {
        neighborhood = ko.computed(function () {
            return new google.maps.LatLng(vm.lat(), vm.lng())
        });
        map = ko.observable(new google.maps.Map(document.getElementById('mapCanvas'), {
            center: neighborhood(),
            zoom: 17
        }));

        // start nearby search request
        var request = {
            location: neighborhood(),
            radius: '200',
            types: vm.typesOfPlaces()
        };
        var service = new google.maps.places.PlacesService(map());
        service.nearbySearch(request, resultsHandler);
        // send results to the ViewModel	
        function resultsHandler(results, status) {
            if (status == google.maps.places.PlacesServiceStatus.OK) {
                // will hold places Ids
                var placesId = [];
                // pushes places id to empty array			
                for (var i = 0; i < results.length; i++) {
                    placesId.push(results[i].place_id);
                    // request to get place details
                    var request = {
                        placeId: placesId[i]
                    };
                    service.getDetails(request, function (place, status) {
                        if (status == google.maps.places.PlacesServiceStatus.OK) {
                            //creates initial markers based on place details
                            vm.placesDetails.push(place);
                            vm.createMarker(place);
                        };
                    })
                };
            };
        };
        // end nearby search request
    },
    loadYelp: function (businessPhone) {
        // nonce generator
        function nonce_generate() {
            return (Math.floor(Math.random() * 1e12).toString());
        }
        //Yelp Credentials
        var YELP_KEY = 'd6BWoZe6uqqYl5xoytRWJA';
        var YELP_KEY_SECRET = 'rEZQsiP5WA_f8kBFCtifxFPzkdU';
        var YELP_TOKEN = '8PJWa3DOZn0aM4uWY8iL18f9fhV3P1D2';
        var YELP_TOKEN_SECRET = 'Yu5I-EbDtktQmOBHKhJtLnc9_gc';
        //Yelp Base URL 
        var yelpUrl = 'http://api.yelp.com/v2/phone_search';
       
        /*
         Using Marco Bettiolo oauth signature generator
         https://github.com/bettiolo/oauth-signature-js
        */
       
        //oauth requirements
        var parameters = {
            oauth_consumer_key: YELP_KEY,
            oauth_token: YELP_TOKEN,
            oauth_nonce: nonce_generate(),
            oauth_timestamp: Math.floor(Date.now() / 1000),
            oauth_signature_method: 'HMAC-SHA1',
            oauth_version: '1.0',
            callback: 'cb', // This is crucial to include for jsonp implementation in AJAX or else the oauth-signature will be wrong.
            phone: businessPhone,
            limit: 1
        };

        var encodedSignature = oauthSignature.generate('GET', yelpUrl, parameters, YELP_KEY_SECRET, YELP_TOKEN_SECRET);
        parameters.oauth_signature = encodedSignature;
      
        // Settings for the AJAX Call
        var settings = {
            url: yelpUrl,
            data: parameters,
            // Must include cache so the default call back function doesnt get add to the URL
            cache: true,
            dataType: 'jsonp',
            success: function (results) {
                
                //sends the first businesses object to the ViewModel
                vm.YelpDetails(results.businesses[0]);
            },
            error: function () {
                // Do stuff on fail
                console.log('Something went wrong');
            }
        };
        // Making the call to YELP
        $.ajax(settings)
    },
    loadFlickr :  function(lat, lon){
        //base flickerURLs
        var flickrUrlPlaces = 'https://api.flickr.com/services/rest/?&method=flickr.places.findByLatLon&api_key=44ff9d6c0d23eb0ed9189437f0bf1da2&jsoncallback=?';
        var flickrUrlPhotos = 'https://api.flickr.com/services/rest/?&method=flickr.photos.search&api_key=44ff9d6c0d23eb0ed9189437f0bf1da2&jsoncallback=?';
        
        //getting the place id based on the lat and lon
        $.getJSON(flickrUrlPlaces,{
            lat : lat,
            lon : lon,
            accuracy : 16,
            format : 'json'
        }).done(function(data){
            //saving the place id into a variable that will be used to search photos
            var placeId = data.places.place[0].place_id;
                
            // search for photos around the place id location
            $.getJSON(flickrUrlPhotos, {
                format: 'json',
                place_id : placeId,
                privacy_filter : 1,
                accuracy : 16,
                content_type : 1,
                per_page : 25
            }).done(function(data){
                //clears photos array
                vm.flickrPhotos.removeAll();
                var photosArray = data.photos.photo;
                for (var i = 0; i < photosArray.length; i++){   
                    //Getting required info to construct the URL
                    var farmId = photosArray[i].farm;
                    var serverId = photosArray[i].server;
                    var photoId = photosArray[i].id;
                    var secret = photosArray[i].secret;
                    
                    //construct the source URL
                    var imgsUrls ='https://farm'+farmId+'.staticflickr.com/'+serverId+'/'+photoId+'_'+secret+'_m.jpg)';
                    
                    //push imgs urls to the ViewModel
                    vm.flickrPhotos.push(imgsUrls);
                }
            }).fail(function(){
                console.log('something went wrong getting the photos')
            })

        }).fail(function(){
            console.log('something went wrong getting the place location')
        });
    }
};

var ViewModel = function () {
    var self = this;
    self.lat = ko.observable(40.8621822);
    self.lng = ko.observable(-73.8935974);
    self.typesOfPlaces = ko.observableArray(['restaurant']);

    //initiates the application by requesting the google map API
    self.init = function () {
        var script = document.createElement('script');
        $(script).attr("type", "text/javascript");
        script.onerror = function (e) {
            alert(e);
        };
        script.src = "https://maps.googleapis.com/maps/api/js?libraries=places&signed_in=true&key=AIzaSyD-ea-0b-EOXWC6svLpOyxcBKs3ecfe1co&callback=model.loadMap";
        $('body').append(script);
    };
    // empty array that will hold the results from the nearbySearch
    self.placesDetails = ko.observableArray([]);
    // empty array for the initial markers created
    self.markers = ko.observableArray([]);

    // filtered array 
    self.query = ko.observable('');
    self.search = ko.computed(function () {
        return ko.utils.arrayFilter(self.markers(), function (point) {
            return point.title.toLowerCase().indexOf(self.query().toLowerCase()) >= 0;
        });
    });

    // any time the filtered array changes, it set the currect markers on the map
    self.search.subscribe(function () {
        self.setMarkers();
    });

    /*
    	createMarkers function -  Creates initial markers, 
    	sends a copy of each marker created to self.marker,
    	adds infowindow content to the marker,
    	also, adds click event listener to open the info window of each marker.  
    */
    self.createMarker = function (place) {
        var placeLoc = place.geometry.location;
        var marker = new google.maps.Marker({
            map: map(),
            position: placeLoc,
            draggable: true,
            animation: google.maps.Animation.DROP,
            title: place.name
        });
        //get details about the place to put into the info window
        var reviewsArray = (!place.reviews) ? [{ text: "No review availables" }] : place.reviews;
        var photo = (!place.photos) ? '<p>Not photos availables</p>' : '<img class="img-responsive center-block" src="' + place.photos[0].getUrl({ 'maxWidth': 200, 'maxHeight': 200 }) + '" alt="location photo"><br/>'
        var phone = (!place.formatted_phone_number) ? "<p><span>Phone: </span>Not Available</p>" : '<p><span>Phone: </span>' + place.formatted_phone_number + '</p>';
        var address = (!place.formatted_address) ? '<p><span>Address: </span>Not Available</p>' : '<p><span>Address: </span>' + place.formatted_address + '</p>';

        var reviewHTML = '<h5>Reviews:</h5><ul>' + reviews() + '</ul>';
        
        //builds up the list of reviews
        function reviews() {
            var reviewList = '';
            for (var i = 0; i < reviewsArray.length; i++) {
                reviewList += '<li><span><em>' + reviewsArray[i].author_name + '</em> - </span>' + reviewsArray[i].text + '<br/>' + '<span>Rating: </span>' + reviewsArray[i].rating + '/5</li><br/>';
            }
            return reviewList;
        };
        // assigning the phone info to each marker in order to perform a phone search using the YELP api
        marker.phone = place.formatted_phone_number;
        //assigning lat and lon to do a flickr search around the mark location
        marker.lat = place.geometry.location.G;
        marker.lon = place.geometry.location.K;
        //info window content displaying place details from google API
        marker.info = new google.maps.InfoWindow({
            content: '<div class="infowindow"><h4 class="text-center">' + place.name + '</h4>'
            + photo
            + address
            + phone
            + reviewHTML
            + '</div>'
        });

        google.maps.event.addListener(marker, 'click', function () {
            marker.info.open(map(), marker);
            //loads the yelp data when clicked
            model.loadYelp(marker.phone);
            //loads flicker photos when clicked
            model.loadFlickr(marker.lat, marker.lon);
            //from ui.js
            externalToggler();
        });

        self.markers.push(marker);
    };

    //deletes all the markers in the map
    self.deleteMarkers = function () {
        for (var i = 0; i < self.markers().length; i++) {
            self.markers()[i].setMap(null);
        }
    };

    self.setMarkers = function () {
        /* 
        deletes all the markers from map first,
        then check how many markers are in the search array
        and place them into the map,
        */
        self.deleteMarkers();
        for (var i = 0; i < self.search().length; i++) {
            self.search()[i].setMap(map());
        }
    };

    self.highlightMarker = function (marker, event) {
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

        window.setTimeout(function () {
            marker.setAnimation(null);
        }, 7000);
        //only opens the info window if the screen width is bigger than 450px, mobile screen gets too crowded
        if ($(window).width() >= 450) {
            marker.info.open(map(), marker);
        }
        
        //loads the yelp data when clicked
        model.loadYelp(marker.phone);
        
        //loads flicker photos when clicked
        model.loadFlickr(marker.lat, marker.lon);
    };

    //Will hold the resutl from the Yelp Search and update the viewModel
    self.YelpDetails = ko.observable();
    
    //Will hold the resutl from flickr and update the viewModel
    self.flickrPhotos = ko.observableArray();

    self.init();
};

var vm = new ViewModel()
ko.applyBindings(vm);