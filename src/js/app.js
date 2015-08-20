/* global google */
/// <reference path="../../typings/jquery/jquery.d.ts"/>
/// <reference path="../../typings/knockout/knockout.d.ts"/>
var map, neighborhood;

// check if google map is loaded
window.setTimeout(function () {
    if (typeof google === 'object' && typeof google.maps === 'object') {
        console.log('google map is loaded');
    } else {
        $('#mapCanvas').html('<div class="map-error"><img class="img-responsive center-block error-img-big" src="images/error-big.jpg" alt="error image"><h3 class="text-center">oops something went wrong with google Maps</h3></div>');
    }
}, 5000);

var model = {
    // loads the map
    loadMap: function () {
        neighborhood = ko.computed(function () {
            return new google.maps.LatLng(vm.lat(), vm.lng())
        });

        map = ko.observable(new google.maps.Map(document.getElementById('mapCanvas'), {
            center: neighborhood(),
            zoom: 17,
            styles: [
                {
                    "featureType": "road",
                    "elementType": "labels.text",
                    "stylers": [
                        { "visibility": "simplified" },
                        { "hue": "#ff1100" },
                        { "color": "#ff0c59" },
                        { "weight": 0.3 },
                        { "lightness": -79 },
                        { "gamma": 1.13 }
                    ]
                }, {
                    "featureType": "landscape.man_made",
                    "elementType": "geometry",
                    "stylers": [
                        { "visibility": "simplified" },
                        { "color": "#e8edf6" },
                        { "lightness": -21 },
                        { "gamma": 6.98 }
                    ]
                }, {
                    "featureType": "road.highway",
                    "stylers": [
                        { "visibility": "simplified" },
                        { "color": "#433540" },
                        { "lightness": 71 }
                    ]
                }, {
                    "featureType": "road.local",
                    "stylers": [
                        { "visibility": "simplified" },
                        { "color": "#8659b8" },
                        { "gamma": 5.3 },
                        { "lightness": 37 }
                    ]
                }, {
                    "featureType": "poi.park",
                    "stylers": [
                        { "visibility": "simplified" },
                        { "color": "#b5d1d8" },
                        { "lightness": 23 }
                    ]
                }, {
                }
            ]
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
                var resultsLength = results.length;
                // pushes places id to empty array			
                for (var i = 0; i < resultsLength; i++) {
                    placesId.push(results[i].place_id);
                    // request to get place details
                    var request = {
                        placeId: placesId[i]
                    };
                    service.getDetails(request, function (place, status) {
                        if (status == google.maps.places.PlacesServiceStatus.OK) {
                            
                            //creates initial markers based on place details
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
        // Yelp Credentials
        var YELP_KEY = 'd6BWoZe6uqqYl5xoytRWJA';
        var YELP_KEY_SECRET = 'rEZQsiP5WA_f8kBFCtifxFPzkdU';
        var YELP_TOKEN = '8PJWa3DOZn0aM4uWY8iL18f9fhV3P1D2';
        var YELP_TOKEN_SECRET = 'Yu5I-EbDtktQmOBHKhJtLnc9_gc';
        // Yelp Base URL 
        var yelpUrl = 'http://api.yelp.com/v2/phone_search';
       
        /*
         Using Marco Bettiolo oauth signature generator
         https://github.com/bettiolo/oauth-signature-js
        */
       
        // oauth requirements
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
      
        // settings for the AJAX Call
        var settings = {
            url: yelpUrl,
            data: parameters,
            // must include cache so the default call back function doesnt get add to the URL
            cache: true,
            dataType: 'jsonp',
            timeout: 1000
        };
        
        // making the call to YELP
        $.ajax(settings).done(function (results) {
            // checks if a error img is been placed and hides it, then shows the results container
            if ($('#yelp .more-info-error').length > 0) {
                $('#yelp .more-info-error').hide();
                $('#yelp .innerWrapper').show();
            }
            // sends the first businesses object to the ViewModel
            vm.YelpDetails(results.businesses[0]);
        }).fail(function () {
            if ($('#yelp .more-info-error').length === 0) {
                $('#yelp .innerWrapper').hide();
                $('#yelp').append('<div class="more-info-error"><img class="error-img img-responsive center-block" src="images/error.jpg" alt="error image"><h3 class="text-center">oops something went wrong with YELP</h3></div>');
            } else {
                $('#yelp .innerWrapper').hide();
                $('#yelp .more-info-error').show();

            }
        });
    },
    loadFlickr: function (lat, lon) {
        // base flicker URLs
        var flickrUrlPlaces = 'https://api.flickr.com/services/rest/?&method=flickr.places.findByLatLon&api_key=44ff9d6c0d23eb0ed9189437f0bf1da2&jsoncallback=?';
        var flickrUrlPhotos = 'https://api.flickr.com/services/rest/?&method=flickr.photos.search&api_key=44ff9d6c0d23eb0ed9189437f0bf1da2&jsoncallback=?';
        
        // getting the place id based on the lat and lon
        $.getJSON(flickrUrlPlaces, {
            lat: lat,
            lon: lon,
            accuracy: 16,
            format: 'json'
        }).done(function (data) {
            
            // saving the place id into a variable that will be used to search photos
            var placeId = data.places.place[0].place_id;
                
            // search for photos around the place id location
            $.getJSON(flickrUrlPhotos, {
                format: 'json',
                place_id: placeId,
                privacy_filter: 1,
                accuracy: 16,
                content_type: 1,
                per_page: 25
            }).done(function (data) {
                // checks if an error img is been placed and hides it, then shows the results container
                if ($('#flickr .more-info-error').length > 0) {
                    $('#flickr .more-info-error').hide();
                    $('#flickr .innerWrapper').show();
                }
                // clears photos array
                vm.flickrPhotos.removeAll();

                var photosArray = data.photos.photo;
                for (var i = 0; i < photosArray.length; i++) {   
                    
                    // getting required info to construct the URL
                    var farmId = photosArray[i].farm;
                    var serverId = photosArray[i].server;
                    var photoId = photosArray[i].id;
                    var secret = photosArray[i].secret;
                    
                    // construct the source URL
                    var imgsUrls = 'https://farm' + farmId + '.staticflickr.com/' + serverId + '/' + photoId + '_' + secret + '_m.jpg)';
                    
                    // push imgs urls to the ViewModel
                    vm.flickrPhotos.push(imgsUrls);
                }
            }).fail(function () {
                if ($('#flickr .more-info-error').length === 0) {
                    $('#flickr .innerWrapper').hide();
                    $('#flickr').append('<div class="more-info-error"><img class="error-img img-responsive center-block" src="images/error.jpg" alt="error image"><h3 class="text-center">oops something went wrong with Flickr</h3></div>')
                } else {
                    $('#flickr .innerWrapper').hide();
                    $('#flickr .more-info-error').show();
                }
            })

        }).fail(function () {
            if ($('#flickr .more-info-error').length === 0) {
                $('#flickr .innerWrapper').hide();
                $('#flickr').append('<div class="more-info-error"><img class="error-img img-responsive center-block" src="images/error.jpg" alt="error image"><h3 class="text-center">oops something went wrong with Flickr</h3></div>')
            } else {
                $('#flickr .innerWrapper').hide();
                $('#flickr .more-info-error').show();
            }
        });
    }
};

var ViewModel = function () {
    var self = this;
    self.lat = ko.observable(40.8621822);
    self.lng = ko.observable(-73.8935974);
    self.typesOfPlaces = ko.observableArray(['restaurant']);

    // initiates the application by requesting the google map API
    self.init = function () {
        var script = document.createElement('script');
        script.src = "https://maps.googleapis.com/maps/api/js?libraries=places&signed_in=true&key=AIzaSyD-ea-0b-EOXWC6svLpOyxcBKs3ecfe1co&callback=model.loadMap";
        $('body').append(script);
    };
      
    // empty array for the initial markers created
    self.markers = ko.observableArray();

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
            title: place.name,
            icon: 'images/map-marker.png'
        });
        // get details about the place to put into the info window
        var reviewsArray = (!place.reviews) ? [{ text: "No review availables" }] : place.reviews;
        var photo = (!place.photos) ? '<p>Not photos availables</p>' : '<img class="img-responsive center-block" src="' + place.photos[0].getUrl({ 'maxWidth': 200, 'maxHeight': 200 }) + '" alt="location photo"><br/>'
        var phone = (!place.formatted_phone_number) ? "<p><span>Phone: </span>Not Available</p>" : '<p><span>Phone: </span>' + place.formatted_phone_number + '</p>';
        var address = (!place.formatted_address) ? '<p><span>Address: </span>Not Available</p>' : '<p><span>Address: </span>' + place.formatted_address + '</p>';

        var reviewHTML = '<h5>Reviews:</h5><ul>' + reviews() + '</ul>';
        
        // builds up the list of reviews
        function reviews() {
            var reviewList = '';
            var reviewsLength = reviewsArray.length;
            for (var i = 0; i < reviewsLength ; i++) {
                reviewList += '<li><span><em>' + reviewsArray[i].author_name + '</em> - </span>' + reviewsArray[i].text + '<br/>' + '<span>Rating: </span>' + reviewsArray[i].rating + '/5</li><br/>';
            }
            return reviewList;
        };
        // assigning the phone info to each marker in order to perform a phone search using the YELP API
        marker.phone = place.formatted_phone_number;
        
        // assigning lat and lon to do a flickr search around the marker location
        marker.lat = place.geometry.location.G;
        marker.lon = place.geometry.location.K;
        
        // info window content - displaying place details from google API
        marker.info = new google.maps.InfoWindow({
            content: '<div class="infowindow"><h4 class="text-center">' + place.name + '</h4>'
            + photo
            + address
            + phone
            + reviewHTML
            + '</div>'
        });
        
        // hides more info button when infoWindow is closed.
        google.maps.event.addDomListener(marker.info,'closeclick',function(){
            closeMoreInfoToggler();
        });

        google.maps.event.addListener(marker, 'click', function () {
            // closes any infowindow opened before
            var selfMarkersLength = self.markers().length;
            for (var i = 0; i < selfMarkersLength; i++) {
                self.markers()[i].info.close();
            }
            
            marker.info.open(map(), marker);
            // loads the yelp data when clicked
            model.loadYelp(marker.phone);
            // loads flicker photos when clicked
            model.loadFlickr(marker.lat, marker.lon);
            // function from ui.js
            moreInfoToggler();
        });

        self.markers.push(marker);
    };

    // deletes all the markers in the map
    self.deleteMarkers = function () {
        var selfMarkersLength = self.markers().length;
        for (var i = 0; i < selfMarkersLength; i++) {
            self.markers()[i].setMap(null);
        }
    };

    self.setMarkers = function () {
        /* 
        deletes all the markers from map first,
        then check how many markers are in the search array
        and place them into the map
        */
        self.deleteMarkers();
        var selfSearchLength = self.search().length;
        for (var i = 0; i < selfSearchLength; i++) {
            self.search()[i].setMap(map());
        }
    };

    self.highlightMarker = function (marker, event) {
        /* 
		Makes the clicked marker bounce for 7 seconds,
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
            
            // closes any infowindow opened before
            var selfMarkersLength = self.markers().length;
            for (var i = 0; i < selfMarkersLength; i++) {
                self.markers()[i].info.close();
            }

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