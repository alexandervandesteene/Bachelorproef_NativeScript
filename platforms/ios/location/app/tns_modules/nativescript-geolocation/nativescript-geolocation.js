"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var enums = require("ui/enums");
var platformModule = require("platform");
var common = require("./nativescript-geolocation-common");
global.moduleMerge(common, exports);
var locationManagers = {};
var watchId = 0;
var minRangeUpdate = 0;
var defaultGetLocationTimeout = 5 * 60 * 1000;
var LocationListenerImpl = (function (_super) {
    __extends(LocationListenerImpl, _super);
    function LocationListenerImpl() {
        _super.apply(this, arguments);
    }
    LocationListenerImpl.new = function () {
        var result = _super.new.call(this);
        watchId++;
        result.id = watchId;
        return result;
    };
    LocationListenerImpl.prototype.initWithLocationErrorOptions = function (location, error, options) {
        this._onLocation = location;
        if (error) {
            this._onError = error;
        }
        if (options) {
            this._options = options;
        }
        return this;
    };
    LocationListenerImpl.prototype.locationManagerDidUpdateLocations = function (manager, locations) {
        for (var i = 0; i < locations.count; i++) {
            var location = locationFromCLLocation(locations.objectAtIndex(i));
            if (this._onLocation) {
                this._onLocation(location);
            }
        }
    };
    LocationListenerImpl.prototype.locationManagerDidFailWithError = function (manager, error) {
        if (this._onError) {
            this._onError(new Error(error.localizedDescription));
        }
    };
    LocationListenerImpl.ObjCProtocols = [CLLocationManagerDelegate];
    return LocationListenerImpl;
}(NSObject));
function locationFromCLLocation(clLocation) {
    var location = new common.Location();
    location.latitude = clLocation.coordinate.latitude;
    location.longitude = clLocation.coordinate.longitude;
    location.altitude = clLocation.altitude;
    location.horizontalAccuracy = clLocation.horizontalAccuracy;
    location.verticalAccuracy = clLocation.verticalAccuracy;
    location.speed = clLocation.speed;
    location.direction = clLocation.course;
    var timeIntervalSince1970 = NSDate.dateWithTimeIntervalSinceDate(0, clLocation.timestamp).timeIntervalSince1970;
    location.timestamp = new Date(timeIntervalSince1970 * 1000);
    location.ios = clLocation;
    return location;
}
function clLocationFromLocation(location) {
    var hAccuracy = location.horizontalAccuracy ? location.horizontalAccuracy : -1;
    var vAccuracy = location.verticalAccuracy ? location.verticalAccuracy : -1;
    var speed = location.speed ? location.speed : -1;
    var course = location.direction ? location.direction : -1;
    var altitude = location.altitude ? location.altitude : -1;
    var timestamp = location.timestamp ? NSDate.dateWithTimeIntervalSince1970(location.timestamp.getTime() / 1000) : null;
    var iosLocation = CLLocation.alloc().initWithCoordinateAltitudeHorizontalAccuracyVerticalAccuracyCourseSpeedTimestamp(CLLocationCoordinate2DMake(location.latitude, location.longitude), altitude, hAccuracy, vAccuracy, course, speed, timestamp);
    return iosLocation;
}
var LocationMonitor = (function () {
    function LocationMonitor() {
    }
    LocationMonitor.getLastKnownLocation = function () {
        var iosLocation;
        for (var locManagerId in locationManagers) {
            if (locationManagers.hasOwnProperty(locManagerId)) {
                var tempLocation = locationManagers[locManagerId].location;
                if (!iosLocation) {
                    iosLocation = tempLocation;
                }
                else {
                    if (tempLocation.timestamp > iosLocation.timestamp) {
                        iosLocation = tempLocation;
                    }
                }
            }
        }
        if (iosLocation) {
            return locationFromCLLocation(iosLocation);
        }
        var locListener = new LocationListenerImpl();
        locListener.initWithLocationErrorOptions(null, null, null);
        iosLocation = LocationMonitor.createiOSLocationManager(locListener, null).location;
        if (iosLocation) {
            return locationFromCLLocation(iosLocation);
        }
        return null;
    };
    LocationMonitor.stopLocationMonitoring = function (iosLocManagerId) {
        if (locationManagers[iosLocManagerId]) {
            locationManagers[iosLocManagerId].stopUpdatingLocation();
            locationManagers[iosLocManagerId].delegate = null;
            delete locationManagers[iosLocManagerId];
        }
    };
    LocationMonitor.startLocationMonitoring = function (options, locListener) {
        var iosLocManager = LocationMonitor.createiOSLocationManager(locListener, options);
        locationManagers[locListener.id] = iosLocManager;
        iosLocManager.startUpdatingLocation();
    };
    LocationMonitor.createListenerWithCallbackAndOptions = function (successCallback, options) {
        var locListener = new LocationListenerImpl();
        locListener.initWithLocationErrorOptions(successCallback, null, options);
        return locListener;
    };
    LocationMonitor.createiOSLocationManager = function (locListener, options) {
        var iosLocManager = new CLLocationManager();
        iosLocManager.delegate = locListener;
        iosLocManager.desiredAccuracy = options ? options.desiredAccuracy : enums.Accuracy.high;
        iosLocManager.distanceFilter = options ? options.updateDistance : minRangeUpdate;
        locationManagers[locListener.id] = iosLocManager;
        return iosLocManager;
    };
    return LocationMonitor;
}());
exports.LocationMonitor = LocationMonitor;
function isEnabled() {
    if (CLLocationManager.locationServicesEnabled()) {
        return (CLLocationManager.authorizationStatus() === CLAuthorizationStatus.kCLAuthorizationStatusAuthorizedWhenInUse
            || CLLocationManager.authorizationStatus() === CLAuthorizationStatus.kCLAuthorizationStatusAuthorizedAlways
            || CLLocationManager.authorizationStatus() === CLAuthorizationStatus.kCLAuthorizationStatusAuthorized);
    }
    return false;
}
exports.isEnabled = isEnabled;
function distance(loc1, loc2) {
    if (!loc1.ios) {
        loc1.ios = clLocationFromLocation(loc1);
    }
    if (!loc2.ios) {
        loc2.ios = clLocationFromLocation(loc2);
    }
    return loc1.ios.distanceFromLocation(loc2.ios);
}
exports.distance = distance;
function enableLocationRequest(always) {
    if (Number(platformModule.device.osVersion) >= 8.0) {
        var iosLocationManager = CLLocationManager.alloc().init();
        if (always) {
            iosLocationManager.requestAlwaysAuthorization();
        }
        else {
            iosLocationManager.requestWhenInUseAuthorization();
        }
    }
}
exports.enableLocationRequest = enableLocationRequest;
function watchLocation(successCallback, errorCallback, options) {
    var locListener = new LocationListenerImpl();
    locListener.initWithLocationErrorOptions(successCallback, errorCallback, options);
    try {
        var iosLocManager = LocationMonitor.createiOSLocationManager(locListener, options);
        iosLocManager.startUpdatingLocation();
        return locListener.id;
    }
    catch (e) {
        LocationMonitor.stopLocationMonitoring(locListener.id);
        errorCallback(e);
        return null;
    }
}
exports.watchLocation = watchLocation;
function clearWatch(watchId) {
    LocationMonitor.stopLocationMonitoring(watchId);
}
exports.clearWatch = clearWatch;
