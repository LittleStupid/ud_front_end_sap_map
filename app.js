var map;

var placeList = [];
var markers = {};
var mvc;
var markerDetail = $('#myModal');

function googleError() {
    mvc.setErrorMsg('Failed to Load Google Map');
    markerDetail.modal('show');
}

function initMap() {
    var pyrmont = {
        lat: 37.424,
        lng: -122.165
    };

    map = new google.maps.Map(document.getElementById('map'), {
        center: pyrmont,
        zoom: 15
    });

    var service = new google.maps.places.PlacesService(map);
    service.nearbySearch({
        location: pyrmont,
        radius: 500,
        type: ['university']
    }, callback);
}

function stopAllMarksAnimation() {
    for (var key in markers) {
        if (markers[key].getAnimation() !== null) {
            markers[key].setAnimation(null);
        }
    }
}

function callback(results, status) {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
        for (var i = 0; i < results.length; i++) {
            markers[results[i].name] = createMarker(results[i]);
            placeList.push(results[i]);
        }
    } else {
        mvc.setErrorMsg('Failed to get google map service');
        markerDetail.modal('show');
    }

    console.log('second init begin');
    mvc.init();
    console.log('second init end');
}

//------begin: Left list group MVC
function PlaceName(name) {
    var self = this;
    self.name = name;
}

function ViewModel() {
    var self = this;

    //////////////////////Bind Left List Group///////////////////////
    self.filterStr = ko.observable('*');
    self.placeNames = ko.observableArray();
    self.allPlaceName = [];


    self.init = function() {
        for (var i = 0; i < placeList.length; i++) {
            self.allPlaceName.push(new PlaceName(placeList[i].name));
        }

        self.filterStr('');
    };

    //update placeNames when filterStr is updated.
    self.placeNames = ko.computed(function() {
        var filter = this.filterStr().toLowerCase();
        if (!filter || filter === '') {
            return self.allPlaceName;
        } else {
            return ko.utils.arrayFilter(self.allPlaceName, function(placeName) {
                return (placeName.name.toLowerCase().indexOf(self.filterStr().toLowerCase()) > -1);
            });
        }
    }, this);

    //update markers' visibility when placeNames is updated.
    self.setMarkerVisiblity = ko.computed(function() {
        for (var key in markers) {
            if (markers.hasOwnProperty(key)) {
                markers[key].setVisible(false);
            }
        }

        for (var i = 0; i < self.placeNames().length; i++) {
            for (var key in markers) {
                if (key == self.placeNames()[i].name) {
                    markers[key].setVisible(true);
                }
            }
        }
    }, this);

    self.listItemClick = function(info) {
        google.maps.event.trigger(markers[info.name], 'click');
    };

    ///////////////SHOP///////////////
    self.shops = ko.observableArray();

    //bind nearby shop into popup board list
    function Shop(info) {
        var self = this;

        this.detail = '';

        if (info.name) {
            this.detail = info.name;
            this.detail += ' : ';
        }

        if (info.location && info.location.address) {
            this.detail += info.location.address;
        } else {
            this.detail += 'no address';
        }
    }

    self.setShops = function(data) {
        self.shops([]);

        shopData = data.response.venues;
        for (var i = 0; i < shopData.length; i++) {
            self.shops.push(new Shop(shopData[i]));
        }
    };

    //////////////MODAL///////////////
    self.markerDetailTitle = ko.observable('');

    self.setModalTitle = function(placeName) {
        self.markerDetailTitle('What can be found near ' + placeName + '.');
    };

    self.setErrorMsg = function(errMsg) {
        self.shops([]);
        self.markerDetailTitle(errMsg);
    };
}

function createMarker(place) {
    var markerDetailTitle = $('#myModalLabel');

    var placeLoc = place.geometry.location;
    var marker = new google.maps.Marker({
        map: map,
        position: place.geometry.location,
        animation: google.maps.Animation.DROP
    });

    google.maps.event.addListener(marker, 'click', function() {
        stopAllMarksAnimation();
        marker.setAnimation(google.maps.Animation.BOUNCE);

        lat = place.geometry.location.lat();
        lng = place.geometry.location.lng();

        //get json from foursquare
        var queryStr = 'https://api.foursquare.com/v2/venues/search?ll=' + lat + ',' + lng + '&client_id=43PPM4KVWLCZKQGUZT3NI3IVSCOLDPIV0JKUQQE21LKGVH1I&client_secret=H3MMRW351WAA5PS4HM1K3NBOAKUDU0QMQPNBBK2GXPGOUZTR&v=20150101';
        $.getJSON(queryStr, function(data) {
            mvc.setShops(data);
            mvc.setModalTitle(place.name);
            markerDetail.modal('show');
        }).error(function(e) {
            mvc.setErrorMsg('we cannot query from the server!');
            markerDetail.modal('show');
        });
    });

    return marker;
}

//for responsive left group list.If screen is too small, list group will be toggled by top_icon.
$(function() {
    var brandIcon = $('#navBrandIcon');
    var leftListGroup = $('#leftBoard');
    var rightMap = $('#map');
    var filterBox = $('#filterBox');

    brandIcon.on('click', function() {
        console.log('BRAND CLICK');
        if (leftListGroup.hasClass('hidden-sm hidden-xs')) {
            leftListGroup.toggleClass('hidden-sm hidden-xs');

            rightMap.toggleClass('col-sm-12 col-xs-12');
            rightMap.addClass('col-sm-8 col-xs-8');
        } else {
            leftListGroup.toggleClass('hidden-sm hidden-xs');

            rightMap.toggleClass('col-sm-8 col-xs-8');
            rightMap.addClass('col-sm-12 col-xs-12');
        }
    });

}());

//reg mvc
mvc = new ViewModel();
ko.applyBindings(mvc);
console.log('First Bind');
