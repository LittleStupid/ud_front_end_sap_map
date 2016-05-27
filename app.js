//$(function() {

var map;
var infowindow;

var placeList = [];
var markers = {};

function initMap() {
    var pyrmont = {
        lat: -33.867,
        lng: 151.195
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
        type: ['store']
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
    }

    function PlaceName(name) {
        var self = this;
        self.name = name;
    }

    function ListGroupViewModel() {
        var self = this;

        self.filter_str = ko.observable('');
        self.placeNames = ko.observableArray();

        for (var i = 0; i < placeList.length; i++) {
            self.placeNames.push(new PlaceName(placeList[i].name));
        }

        self.Filter = ko.computed(function(sub_str) {
            self.placeNames([]);
            for (var i = 0; i < placeList.length; i++) {
                self.placeNames.push(new PlaceName(placeList[i].name));
            }

            for (var key in markers) {
                markers[key].setVisible(true);
            }

            removeList = self.placeNames.remove(function(item) {
                return (item.name.indexOf(self.filter_str()) <= -1);
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
        }
    }

    ko.applyBindings(new ListGroupViewModel());
}

function createMarker(place) {
    var markerDetail = $('#myModal');
    var markerDetailTitle = $('#myModalLabel')
    var modalImg = $('#streetImg');

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

        //console.log(place);
        //console.log(marker);
        lat = place.geometry.location.lat();
        lng = place.geometry.location.lng();
        var address = 'https://maps.googleapis.com/maps/api/streetview?size=400x400&fov=90&heading=235&pitch=10&key=AIzaSyBW0BnFi_VnKwIYhLU7l875RVO3HeGIgpI&location=' + lat + ',' + lng;
        console.log(address);
        modalImg.attr('src', address);
        markerDetailTitle.text(place.name);
        markerDetail.modal('show');
    });

    return marker;
}
//'https://maps.googleapis.com/maps/api/streetview?size=400x400&fov=90&heading=235&pitch=10&key=AIzaSyBW0BnFi_VnKwIYhLU7l875RVO3HeGIgpI&location=' + lat + ',' + lng

$(function() {
    console.log("test Init")

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
