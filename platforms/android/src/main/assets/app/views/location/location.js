var geolocation = require("nativescript-geolocation");
var frameModule = require("ui/frame");
var loc = {};

exports.pageLoaded = function(args){
    var page = args.object;

    loc.latitude = "";
    loc.longitude = "";

    page.bindingContext = {loc:loc};
};


function enableLocationTap(args) {
    if (!geolocation.isEnabled()) {
        geolocation.enableLocationRequest();
    }
}
exports.enableLocationTap = enableLocationTap;

function buttonGetLocationTap(args) {
    var date = new Date();

    var location = geolocation.getCurrentLocation({desiredAccuracy: 3, updateDistance: 10, maximumAge: 20000, timeout: 20000}).
    then(function(loca) {
        if (loca) {
            var date2 = new Date();
            //console.log(date2);
            var test = date2.getTime()-date.getTime();
            var secondsDifference = test/1000;
            alert("time location: " + secondsDifference );

            //console.log("gevonden");
            loc.latitude = loca.latitude;
            loc.longitude = loca.longitude;
            //console.log(JSON.stringify(loc));
        }
    }, function(e){
        console.log("Error: " + e.message);
    });
}
exports.buttonGetLocationTap = buttonGetLocationTap;