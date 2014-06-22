var checkGeo = function(){
	// Check if the browser supports geolocation
	if (navigator.geolocation){
			navigator.geolocation.getCurrentPosition(successPosition, errorPosition, { timeout: 10000 });
	} else {
		var userlat = 44.9833;
		var userlong = -93.2667;
		alert("Sorry, your browser doesn't support geolocation. Using default coordinates.");  
	}
};

var successPosition = function(position){
	var userlat = position.coords.latitude;
	var userlong = position.coords.longitude;
	//console.log(userlat);
	//console.log(userlong);
	//console.log("Congrats! Your position was set from the browser.")
	initMap(userlat, userlong);
};

var errorPosition = function(err){
	if (err.code == 1){
		var userlat = 44.9833;
		var userlong = -93.2667;
		alert("You need to share your location to use this app!");
	} else if(err.code == 2){
		var userlat = 44.9833;
		var userlong = -93.2667;
		alert("Hmm... Looks like your position isn't available right now. Using default coordinates.");
	} else {
		var userlat = 44.9833;
		var userlong = -93.2667;
		alert("Sorry! Can't find your location for some reason. Using default coordinates.");
	}
	initMap(userlat, userlong);
};

var initMap = function(userlat, userlong){
	// Define 'events' variable to add events markers to; define them as a MarkerClusterGroup so they'll cluster using MarkerCluster extension from Leaflet
	//var events = new L.MarkerClusterGroup();
	// Make a map centered on user location (or default to Minneapolis), using Google Maps as baselayer
	var map = L.map('parksmap').setView([userlat, userlong], 12);
	var googleLayer = new L.Google('ROADMAP');
	map.addLayer(googleLayer);
	mapit(map);
};

var mapit = function(map){
	var events = new L.MarkerClusterGroup();
	getparksdata(events);
	geteventsdata(events);
	getsampledata(events);

	// Add events data as a layer
	map.addLayer(events);      
};

// --------- Data sources -----------------
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

// AJAX request to get eventsdata JSON data from Heroku server
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
// --------- end Data sources -----------------
