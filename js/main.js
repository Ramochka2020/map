// Declare variables

var map;

//Initialize Google map based on predefined Northshore position

function initMap() {
    var NorthShore= {
        lat: 49.3248,
        lng: -123.1368
    };
    
//Center map on North shore, BC
  map = new google.maps.Map(document.getElementById("mapDiv"), {
    
       center: NorthShore,
       zoom: 13,
  });

   //Call the viewModel 
  ko.applyBindings(new ViewModel());

}

//create an OBJECT
var markerloc = function(data) {
  
  var self = this;
  self.address = ko.observable('');
  self.contentString = ko.observable('');
  self.lat = ko.observable(data.lat);
  self.lng = ko.observable(data.lng);
  self.marker = ko.observable();
  self.title = ko.observable(data.title);
  self.url = ko.observable(data.url);
  self.id = ko.observable('');

};



//View Model

var ViewModel = function() {

  var self = this;
   //Create a new infowindow
  var infowindow = new google.maps.InfoWindow({
    maxWidth: 175
  });
  
  //Set up the Knockout bindings

  var bounds = new google.maps.LatLngBounds();
  var venue;
  var location;
  var marker;
  var SearchUserInput;
  var url;
  var id;
    
  var defaultIcon = 'img/flag1.png';
    // Create a "highlighted location" marker color 
    
  var highlightedIcon = 'img/flag2.png';

  self.LocMarker = ko.observableArray([]);

  // Initialize foursqError to false 
  self.foursqError = ko.observable(false);

  // Create and store each object in observable array
  locations.forEach(function(LocData) {
    self.LocMarker.push(new markerloc(LocData));
  });


// Add marker at each location 

  self.LocMarker().forEach(function(LocData) {

    marker = new google.maps.Marker({
      position: new google.maps.LatLng(LocData.lat(), LocData.lng()),
      map: map,
      icon: defaultIcon,
      animation: google.maps.Animation.DROP
    });
    bounds.extend(marker.position);
    LocData.marker = marker;

    // Ajax api call to FourSquare 
    // client id and client secret for Foursquare API
    $.ajax({
      url: 'https://api.foursquare.com/v2/venues/search',
      dataType: 'json',
      data: 'limit=1' + '&ll=49.3248,-123.1368' + '&query=' + LocData.title() +
        '&client_id=BKRSVIGAQ0CWX0D5YIRGSJB4VHNA1U4TTZKKJMBXR5KQZ0DQ' +
        '&client_secret=2Y3Q5ABKV3QGD2J0JDIPLH4EE0HU0EV2KUZWLZCUZNKBLEQH&v=20170810',
      async: true,
        
    // if we sucessed to connected with Foursquare
      success: function(data) {
       
        venue = data.response.hasOwnProperty("venues") ? data.response.venues[0] : '';

        // set the address for current location
        
        location = venue.hasOwnProperty('location') ? venue.location : '';
        if (location.hasOwnProperty('address')) {
          LocData.address(location.address || '');
        }
       
        // set the id for location
        id = venue.hasOwnProperty('id') ? venue.id : '';
        LocData.id(id || '');

        // create HTML for the venue!
        LocData.contentString = '<div><h2>' + LocData.title() +'</h2><p>' +'<a href="http://' +
        LocData.url() + '" target="_blank">' + LocData.url() + '</a></p><p>' +
        LocData.address() + '</p><p><a style="text-decoration: underline" target="_blank" href=https://www.google.com/maps/dir/Current+Location/' +
        LocData.lat() + ',' + LocData.lng() + '>Direction</a></p></div><p>' + 
        '</p><hr><h5>Data from <a href="http://foursquare.com/v/' +
         
        LocData.id() + '?ref=BKRSVIGAQ0CWX0D5YIRGSJB4VHNA1U4TTZKKJMBXR5KQZ0DQ">FourSquare</a></h5>';
      },

      // if we failed to coccented,show error message in the infowindow 
      error: function(e) {
        infowindow.setContent('<p>There was an error with the Foursquare API. Please try again!!</p>');
      }
    });

    
      
    // show details info when user click on a marker
    // and bounce and change the icon 

    google.maps.event.addListener(LocData.marker, 'click', function() {
      infowindow.open(map, this);
      toggleBounce(this);
      infowindow.setContent(LocData.contentString);
    });
    
    
    // Two event listeners - one for mouseover, one for mouseout,
    // to change the icon back and forth.
    LocData.marker.addListener('mouseover', function() {
        LocData.marker.setIcon(highlightedIcon);
    });
    LocData.marker.addListener('mouseout', function() {
        LocData.marker.setIcon(defaultIcon);
    });
 
   
      
  });

// Add bounce to a marker and set time out 

function toggleBounce(marker) {
  if (marker.getAnimation() !== null) {
    marker.setAnimation(null);
  } else {
    marker.setAnimation(google.maps.Animation.BOUNCE);
    setTimeout(function() {
        marker.setAnimation(null);
    }, 1400);
  }
}

    
  map.fitBounds(bounds);

// Populates the infowindow when the marker is clicked 
// hide the menu
  self.popInfoWindow = function(LocData) {
    google.maps.event.trigger(LocData.marker, 'click');
    $(".menu").slideToggle("slow", function() {
      $(".close").hide();
      $(".hamburger").show();
    });
  };

  self.visible = ko.observableArray();

  // set all markers to visible
  self.LocMarker().forEach(function(place) {
    self.visible.push(place);
  });


  self.SearchUserInput = ko.observable('');

 // filter and return location that match the user's search 

  self.filterMarkers = function() {
    // change the serach inpt to Lower Case
    SearchUserInput = self.SearchUserInput().toLowerCase();
    infowindow.close();
     //Reset all the marker on map 
    self.visible.removeAll();

    self.LocMarker().forEach(function(place) {
      place.marker.setVisible(false);
      // if we have match the place will be added to the visible array
      if (place.title().toLowerCase().indexOf(SearchUserInput) !== -1) {
        self.visible.push(place);
      }
    });
    // Set marker visibility to true 
    self.visible().forEach(function(place) {
      place.marker.setVisible(true);
    });
  };

};

function GErrorMessage() {
	alert("Sorry.. we have a problem to laod the Google map, Please try again later");
}
//Hamburger Menu 
$(".close").hide();
$(".menu").hide();
$(".hamburger").click(function() {
  $(".menu").slideToggle("slow", function() {
    $(".hamburger").hide();
    $(".close").show();
  });
});

$(".close").click(function() {
  $(".menu").slideToggle("slow", function() {
    $(".close").hide();
    $(".hamburger").show();
  });
});
