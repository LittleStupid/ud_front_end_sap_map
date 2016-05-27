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
        //console.log(placeList);

        for (var i = 0; i < placeList.length; i++) {
            self.placeNames.push(new PlaceName(placeList[i].name));
        }

        console.log(markers);
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

            console.log("Rmv List");
            console.log(removeList);
            console.log(markers);
            for (var i = 0; i < removeList.length; i++) {
                for (var key in markers) {
                    if (key == removeList[i].name) {
                        markers[key].setVisible(false);
                    }
                }
            }
        }, this);
    }

    ko.applyBindings(new ListGroupViewModel());
}

function createMarker(place) {
    var marker_detail = $('#myModal');
    var marker_detail_title = $('#myModalLabel')

    var placeLoc = place.geometry.location;
    var marker = new google.maps.Marker({
        map: map,
        position: place.geometry.location
    });

    google.maps.event.addListener(marker, 'click', function() {
        infowindow.setContent(place.name);
        //infowindow.open(map, this);


        //marker_detail.querySelector("#child").style.display = "none";
        console.log(marker_detail_title);
        marker_detail_title.text(place.name);
        marker_detail.modal('show');

        console.log(marker_detail_title);
        //console.log('MARK CLICKED');
        console.log(place);
    });

    return marker;
}


//google.maps.event.addDomListener(window, 'load', init_map);
//});

$(function() {
    console.log("test Init")

    var brand_icon = $('#nav_brand_icon');
    var left_list_group = $('#left_board');
    var right_map = $('#map');
    var filter_box = $('#filter_box');

    brand_icon.on('click', function() {
        if (left_list_group.hasClass('hidden-sm hidden-xs')) {
            left_list_group.toggleClass('hidden-sm hidden-xs');

            right_map.toggleClass('col-sm-12 col-xs-12');
            right_map.addClass('col-sm-8 col-xs-8');
        } else {
            left_list_group.toggleClass('hidden-sm hidden-xs');

            right_map.toggleClass('col-sm-8 col-xs-8');
            right_map.addClass('col-sm-12 col-xs-12');
        }
    });

}());
/////////////////////////////////
