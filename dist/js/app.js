var map,neighborhood,model={loadMap:function(){function e(e,a){if(a==google.maps.places.PlacesServiceStatus.OK)for(var t=[],n=0;n<e.length;n++){t.push(e[n].place_id);var r={placeId:t[n]};o.getDetails(r,function(e,a){a==google.maps.places.PlacesServiceStatus.OK&&(vm.placesDetails.push(e),vm.createMarker(e))})}}neighborhood=ko.computed(function(){return new google.maps.LatLng(vm.lat(),vm.lng())}),map=ko.observable(new google.maps.Map(document.getElementById("mapCanvas"),{center:neighborhood(),zoom:17}));var a={location:neighborhood(),radius:"200",types:vm.typesOfPlaces()},o=new google.maps.places.PlacesService(map());o.nearbySearch(a,e)},loadYelp:function(e){function a(){return Math.floor(1e12*Math.random()).toString()}var o="d6BWoZe6uqqYl5xoytRWJA",t="rEZQsiP5WA_f8kBFCtifxFPzkdU",n="8PJWa3DOZn0aM4uWY8iL18f9fhV3P1D2",r="Yu5I-EbDtktQmOBHKhJtLnc9_gc",s="http://api.yelp.com/v2/phone_search",i={oauth_consumer_key:o,oauth_token:n,oauth_nonce:a(),oauth_timestamp:Math.floor(Date.now()/1e3),oauth_signature_method:"HMAC-SHA1",oauth_version:"1.0",callback:"cb",phone:e,limit:1},l=oauthSignature.generate("GET",s,i,t,r);i.oauth_signature=l;var p={url:s,data:i,cache:!0,dataType:"jsonp",success:function(e){vm.YelpDetails(e.businesses[0])},error:function(){console.log("paso algo")}};$.ajax(p)}},ViewModel=function(){var e=this;e.lat=ko.observable(40.8621822),e.lng=ko.observable(-73.8935974),e.typesOfPlaces=ko.observableArray(["restaurant"]),e.init=function(){var e=document.createElement("script");$(e).attr("type","text/javascript"),e.onerror=function(e){alert(e)},e.src="https://maps.googleapis.com/maps/api/js?libraries=places&signed_in=true&key=AIzaSyD-ea-0b-EOXWC6svLpOyxcBKs3ecfe1co&callback=model.loadMap",$("body").append(e)},e.placesDetails=ko.observableArray([]),e.markers=ko.observableArray([]),e.query=ko.observable(""),e.search=ko.computed(function(){return ko.utils.arrayFilter(e.markers(),function(a){return a.title.toLowerCase().indexOf(e.query().toLowerCase())>=0})}),e.search.subscribe(function(){e.setMarkers()}),e.createMarker=function(a){function o(){for(var e="",a=0;a<r.length;a++)e+="<li><span><em>"+r[a].author_name+"</em> - </span>"+r[a].text+"<br/><span>Rating: </span>"+r[a].rating+"/5</li><br/>";return e}var t=a.geometry.location,n=new google.maps.Marker({map:map(),position:t,draggable:!0,animation:google.maps.Animation.DROP,title:a.name}),r=a.reviews?a.reviews:[{text:"No review availables"}],s=a.photos?'<img class="img-responsive center-block" src="'+a.photos[0].getUrl({maxWidth:200,maxHeight:200})+'" alt="location photo"><br/>':"<p>Not photos availables</p>",i=a.formatted_phone_number?"<p><span>Phone: </span>"+a.formatted_phone_number+"</p>":"<p><span>Phone: </span>Not Available</p>",l=a.formatted_address?"<p><span>Address: </span>"+a.formatted_address+"</p>":"<p><span>Address: </span>Not Available</p>",p="<h5>Reviews:</h5><ul>"+o()+"</ul>";n.phone=a.formatted_phone_number,n.info=new google.maps.InfoWindow({content:'<div class="infowindow"><h4 class="text-center">'+a.name+"</h4>"+s+l+i+p+"</div>"}),google.maps.event.addListener(n,"click",function(){n.info.open(map(),n),model.loadYelp(n.phone),externalToggler()}),e.markers.push(n)},e.deleteMarkers=function(){for(var a=0;a<e.markers().length;a++)e.markers()[a].setMap(null)},e.setMarkers=function(){e.deleteMarkers();for(var a=0;a<e.search().length;a++)e.search()[a].setMap(map())},e.highlightMarker=function(e,a){e.setAnimation(null!=e.getAnimation()?null:google.maps.Animation.BOUNCE),window.setTimeout(function(){e.setAnimation(null)},7e3),$(window).width()>=450&&e.info.open(map(),e),model.loadYelp(e.phone)},e.YelpDetails=ko.observable(),e.init()},vm=new ViewModel;ko.applyBindings(vm);