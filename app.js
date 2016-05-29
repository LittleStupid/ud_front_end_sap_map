var map;
var infowindow;

var placeList = [];
var markers = {};
var mvc;

function initMap() {
    var pyrmont = {
        lat: 37.424,
        lng: -122.165
    };

    map = new google.maps.Map(document.getElementById('map'), {
        center: pyrmont,
        zoom: 15
    });

    infowindow = new google.maps.InfoWindow();
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
        console.log("Failed to get google map service");
    }

    //reg left list group mvc
    mvc = new ViewModel();
    ko.applyBindings(mvc);
}

//------begin: Left list group MVC
function PlaceName(name) {
    var self = this;
    self.name = name;
}

function ViewModel() {
    var self = this;

    //////////////////////Bind Left List Group///////////////////////
    self.filterStr = ko.observable('');
    self.placeNames = ko.observableArray();

    for (var i = 0; i < placeList.length; i++) {
        self.placeNames.push(new PlaceName(placeList[i].name));
    }

    self.filter = ko.computed(function() {
        self.placeNames([]);
        for (var i = 0; i < placeList.length; i++) {
            self.placeNames.push(new PlaceName(placeList[i].name));
        }

        for (var key in markers) {
            if (markers[key]) {
                markers[key].setVisible(true);
            }
        }

        removeList = self.placeNames.remove(function(item) {
            return (item.name.toLowerCase().indexOf(self.filterStr().toLowerCase()) <= -1);
        });

        for (var i = 0; i < removeList.length; i++) {
            for (var key in markers) {
                if (key == removeList[i].name) {
                    markers[key].setVisible(false);
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
    }

    self.setErrorMsg = function(errMsg) {
        self.shops([]);
        self.markerDetailTitle(errMsg);
    }
}

function createMarker(place) {
    var markerDetail = $('#myModal');
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

        infowindow.setContent(place.name);
        //infowindow.open(map, this);

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
