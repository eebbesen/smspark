// GEOLOCATE THE USER
// Check if the browser supports geolocation, and set userlat/userlong coordinates.
// Or, if browser doesn't support geolocation set default coordinates centered on Mpls.

var checkGeo = function(){
	// Check if the browser supports geolocation
	if (navigator.geolocation){
			navigator.geolocation.getCurrentPosition(successPosition, errorPosition, { timeout: 10000 });
	} else {
		var userlat = 44.9833;
		var userlong = -93.2667;
		alert("Sorry, your browser doesn't support geolocation. Using default coordinates.");
		initMap(userlat, userlong, map); 
	}
};

var successPosition = function(position, map){
	var userlat = position.coords.latitude;
	var userlong = position.coords.longitude;
	//console.log(userlat);
	//console.log(userlong);
	//console.log("Congrats! Your position was set from the browser.")
	initMap(userlat, userlong, map);
};

var errorPosition = function(err, map){
	if (err.code == 1){
		var userlat = 44.9833;
		var userlong = -93.2667;
		alert("Looks like you aren't sharing your location! Using default coordinates.");
	} else if(err.code == 2){
		var userlat = 44.9833;
		var userlong = -93.2667;
		alert("Hmm... Looks like your position isn't available right now. Using default coordinates.");
	} else {
		var userlat = 44.9833;
		var userlong = -93.2667;
		alert("Sorry! Can't find your location for some reason. Using default coordinates.");
	}
	initMap(userlat, userlong, map);
};


function onLocationFound(e) {
		console.log("Adding marker at your location!");
	    // create a marker at the users "latlng" and add it to the map
	    L.marker(e.latlng).addTo(map);
	    
};

map.on('locationfound', onLocationFound);

// INITIALIZE THE MAP
var initMap = function(userlat, userlong, map){
	// Update map to center on user location (or default to Minneapolis)
	map.locate({setView: true, maxZoom: 14});

	// Call mapIt function, which adds data layers to map
	mapIt(map);

};
	

var mapIt = function(map){
	// Initiate an 'events' array, and turn it into a ClusterGroup so leaflet.markercluster
	// plugin can auto-cluster events for display 
	var events = new L.MarkerClusterGroup();
	
	// Populate 'events' array with data from different sources (Socrata, Twilio/Heroku, etc.)
	getsampledata(events);
	getparksdata(events);
	geteventsdata(events);

	// Add events data as a layer
	map.addLayer(events);

	// Add clickable park boundaries as a GeoJSON layer
	mapparkboundaries(map);    
};


// --------- DATA SOURCES -------------

// Define some sample data to display, if all else fails
var sampledata = [
{
	"date": "2013-11-10T00:00:00.000Z",
	"park": "phillips",
	"lat":"44.9833", 
	"long":"-93.2667",
	"game": "baseball",
	"start_time": "2013-11-10T18:00:00.000Z",
	"end_time": "2013-11-10T20:00:00.000Z",
	"extra_info": "Audlt and kids welcome!",
	"url": "http://localhost:3000/events/1.json"
},
{
	"date": "2013-11-10T00:00:00.000Z",
	"park": "corcoran",
	"lat":"44.9422", 
	"long":"-93.2438",
	"game": "mojo kickball",
	"start_time": "2013-11-10T18:00:00.000Z",
	"end_time": "2013-11-10T20:00:00.000Z",
	"extra_info": "Audlt and kids welcome!",
	"url": "http://localhost:3000/events/2.json"
},
{
	"date": "2013-11-11T00:00:00.000Z",
	"park": "hogwarts",
	"lat":"44.9833", 
	"long":"-93.2667",
	"game": "quidditch",
	"start_time": null,
	"end_time": null,
	"extra_info": "Kids welcome!",
	"url": "http://localhost:3000/events/3.json"
}];

var getsampledata = function (events) {
	// Add sampledata info from each event to textbox
			$.each(sampledata, function( index, obj ){
				$('#eventsdata').append("<h2>" + obj.park + "</h2>" + "<p>" + obj.extra_info + "</p>");
			});      

	//Populate map with some sample data so the map looks cool, even if the eventsdata isn't loading
	$.each(sampledata, function( index, obj ){

		// Convert dates from ISO 8601 format to human-friendly format
		var starttime = new Date(obj.start_time).toLocaleString();
		var endtime = new Date(obj.end_time).toLocaleString();

		events.addLayer(L.marker([obj.lat, obj.long]).bindPopup(
										"<h1>" + obj.game + "</h1>"
										+ "<h2>" + obj.park + "</h2>" 
										+ "<h3>" + starttime + "</h3>"
										+ "<h3>" + endtime + "</h3>"
										+ "<p>" + obj.extra_info + "</p>"));
	});
};

// AJAX request to get parksdata JSON data from Socrata
var getparksdata = function(events) {
	$.ajax({
			url: 'http://communities.socrata.com/resource/9tqz-ayry.json',
			dataType: 'json',
		success: function(data){
			parksdata = data;

			// Add parksdata info from each event to textbox
			$.each(parksdata, function( index, obj ){
				$('#eventsdata').append("<h2>" + obj.park_name + "</h2>" + "<p>" + obj.address + "</p>");
			});

			// Creates a layer for each park data point using parks data from Socrata
			$.each(parksdata, function( index, obj ){
				events.addLayer(L.marker([obj.geocode.longitude, obj.geocode.latitude]).bindPopup(
											"<h2>" + obj.park_name + "</h2>"
											+ "<p>" + obj.address + "</p>"));
			});
		},
		error: function(err){
			 console.log(err);
		 }
	 });
};

// AJAX request to get eventsdata JSON data from Heroku server (submitted via text using Twilio)
var geteventsdata = function (events) {
	$.ajax({
			//url: 'http://textmypark.herokuapp.com/events.json',
			url: 'http://jsonpify.heroku.com?resource=http://textmypark.herokuapp.com/events.json',
			dataType: 'jsonp',
		success: function(data){
			eventsdata = data;

			// Add eventsdata info from each event to textbox
			$.each(eventsdata, function( index, obj ){
				$('#eventsdata').append("<h2>" + obj.park + "</h2>" + "<p>" + obj.extra_info + "</p>");
			});

			// Populate map with eventsdata
			if(eventsdata.length) {
				$.each(eventsdata, function( index, obj ){
					var starttime = new Date(obj.start_time).toLocaleString();
					var endtime = new Date(obj.end_time).toLocaleString();
					events.addLayer(L.marker([44.9833, -93.2667]).bindPopup(
												"<h1>" + obj.game + "</h1>"
												+ "<h2>" + obj.park + "</h2>" 
												+ "<h3>" + starttime + "</h3>"
												+ "<h3>" + endtime + "</h3>"
												+ "<p>" + obj.extra_info + "</p>"));
				});
			}
		},
		error: function(err){
			 console.log(err);
		 }
	 });
};


// getJSON request to add Minneapolis park boundaries data from parkssimple.geojson
// file, and add popup displaying park attributes
var mapparkboundaries = function(map) {
	var parkboundariesstyle = {
	    "color": "#3B5323",
	    "weight": 5,
	    "opacity": 0.65
	};

	$.getJSON("../parkssimple.geojson", function(data) {
	    var parkboundaries = L.geoJson(data, {
	    	style: parkboundariesstyle,
	      	onEachFeature: function (feature, layer) {
		        layer.bindPopup("<h2>" + feature.properties.mpls_par_1 + "</h2>"
		        	+ "<h3>" + feature.properties.mpls_par_3 + "</h3>"
		        	+ "<p>" + feature.properties.mpls_par_5 + "</p>"
		        	+ "<a href=" + feature.properties.mpls_parks + " target='_blank'>Go to website!</a>");
		      }
	    });
	    console.log(parkboundaries);
	    parkboundaries.addTo(map);    	
    });    
};

// --------- end Data sources -----------------
