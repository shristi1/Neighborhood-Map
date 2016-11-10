'use strict';

//model
var locations = [
	{
		name: 'Fairfield Public Library',
		lat: 41.004431,
		lng: -91.964327,
		url: 'youseemore.com'
	},
	{
		name: 'Cafe Paradiso',
		lat: 41.007977,
		lng: -91.963584,
		url: 'cafeparadiso.net'
	},
	{
		name: 'Sondheim Center for the Performing Arts',
		lat: 41.009124,
		lng: -91.96436,
		url: 'fairfieldacc.com'
	},
	{
		name: 'Maharishi School of the Age of Enlightenment',
		lat: 41.015603, 
		lng: -91.967015,
		url: 'http://maharishischooliowa.org'
	},
	{
		name: 'Maharishi University of Management',
		lat: 41.017824, 
		lng: -91.967269,
		url: 'mum.edu'
	},
	{
		name: 'Revelations Cafe & Bookstore',
		lat: 41.008404, 
		lng: -91.964153,
		url: 'revelationscafe.com'
	},
	{
		name: 'Everybodys Whole Foods',
		lat: 41.012476, 
		lng: -91.964677,
		url: 'everybodyswholefoods.com'
	},
	{
		name: 'Howard Park',
		lat: 41.010452, 
		lng: -91.963158,
		url: 'http://www.travelfairfield.com/business/howard-park'
	}

];

// Set global variable(s)
var map;
self.active = ko.observable();


// View
var Location = function(data) {
	var self = this;
	this.name = data.name;
	this.lat = data.lat;
	this.lng = data.lng;
	this.URL = data.url;
	this.wikiSnippet = "";

	this.visible = ko.observable(true);


	// If the wikiRequest times out, then display a message with a link to the Wikipedia page.
	var wikiRequestTimeout = setTimeout(function() {
		self.wikiSnippet = "Unable to access Wikipedia.";
	}, 1000);

	// Wiki search url
	var wikiQuery = 'https://en.wikipedia.org/w/api.php?action=opensearch&search=' + this.name + '&limit=1&format=json&callback=wikiCallback';

	$.ajax({url: wikiQuery,
		dataType:'jsonp',
		success: function(data) {
			self.infoWindow.setContent("Still Loading!");
			// add the wikiSnippet data
			self.wikiSnippet = data[2];
			if(typeof data[2] == 'undefined'){
				self.wikiSnippet = "No Wikipedia articles available.";
			}
			clearTimeout(wikiRequestTimeout);
		}
	});


	this.contentString = '<div class="info-window-content"><div class="title"><b>' + data.name + "</b></div>" +
        '<div class="content"><a href="' + self.URL +'">' + self.URL + "</a></div>"+
        '<div class="content">' + self.wikiSnippet + "</div>";

    // new infoWindow
	this.infoWindow = new google.maps.InfoWindow({content: self.contentString});

	// add marker
	this.marker = new google.maps.Marker({
			position: new google.maps.LatLng(data.lat, data.lng),
			map: map,
			title: data.name
	});

	// show marker
	this.showMarker = ko.computed(function() {
		if(this.visible() === true) {
			this.marker.setMap(map);
		} else {
			this.marker.setMap(null);
		}
		return true;
	}, this);

	// show information for a marker when clicked
	this.marker.addListener('click', function(){
		self.contentString = '<div class="info-window-content"><div class="title"><b>' + data.name + "</b></div>" +
        '<div class="content"><a href="' + self.URL +'">' + self.URL + "</a></div>" +
        '<div class="content">' + self.wikiSnippet + "</div>";
       
        self.infoWindow.setContent(self.contentString);
        active(true);
		self.infoWindow.open(map, this);

		self.marker.setAnimation(google.maps.Animation.BOUNCE);
      	setTimeout(function() {
      		self.marker.setAnimation(null);
     	}, 2100);
	});

	// Marker bounces when triggered
	this.bounce = function(place) {
		google.maps.event.trigger(self.marker, 'click');
	};
};

// View Model
function AppViewModel() {
	var self = this;

	this.searchTerm = ko.observable("");

	this.locationList = ko.observableArray([]);

	// New map
	map = new google.maps.Map(document.getElementById('map'), {
			zoom: 12,
			center: {lat: 41.008198, lng: -91.969479},
			mapTypeControl: false
	});

	// Add location
	locations.forEach(function(locationItem){
		self.locationList.push( new Location(locationItem));
	});

	// Search Funtionality
	this.filteredList = ko.computed( function() {
		var filter = self.searchTerm().toLowerCase();
		if (!filter) {
			self.locationList().forEach(function(locationItem){
				locationItem.visible(true);
			});
			return self.locationList();
		} else {
			return ko.utils.arrayFilter(self.locationList(), function(locationItem) {
				var string = locationItem.name.toLowerCase();
				var result = (string.search(filter) >= 0);
				locationItem.visible(result);
				return result;
			});
		}
	}, self);
	// Toggle Menu
		if (window.matchMedia('(max-width: 736px)').matches) {
		  active(true); // Write to ko observable
		} else {
		  active(false);
		}

		$(window).on('resize', function() {
		  if (window.matchMedia('(max-width: 736px)').matches) {
		    active(true)
		  } else {
		    active(false);
		  }
		});
	    self.toggleActive = function(){
	        active(!active()); 
	    }

	this.mapElem = document.getElementById('map');
	this.mapElem.style.height = window.innerHeight - 50;
}

// Start app
function initMap() {
	var vm = new AppViewModel();
	ko.applyBindings(vm);
}

// Google Error
function errorHandling() {
	alert("Google Maps has failed to load. This may be because of your internet connection.");
}