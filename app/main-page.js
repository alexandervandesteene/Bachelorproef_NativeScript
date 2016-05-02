var http = require("http");
var frameModule = require("ui/frame");

var createViewModel = require("./main-view-model").createViewModel;

function onNavigatingTo(args) {
    var page = args.object;
    var date = new Date();
    http.getJSON("http://phpapialex.azurewebsites.net/getContacts.php").then(function (r) {
        // Argument (r) is JSON!
        var date2 = new Date();
        //console.log(date2);
        var test = date2.getTime()-date.getTime();
        var secondsDifference = test/1000;
        alert("time 100 gebruikers: " + secondsDifference );

        //console.log(JSON.stringify(r));
        page.bindingContext = {users: r};
    }, function (e) {
        // Argument (e) is Error!
        //console.log(e);
    });

    page.bindingContext = createViewModel();
}
exports.onNavigatingTo = onNavigatingTo;

function addUsers(){
    //console.log("we hebben geklikt dqfdq");
    var date = new Date();

    var navigationEntry = {
        moduleName:"views/addUser/addUser",
        context:{date:date}
    };

    frameModule.topmost().navigate(navigationEntry);
}
exports.addUsers = addUsers;

exports.getInfo = function (args) {
    //console.log("going to Next");

    var navigationEntry = {
        moduleName:"views/editUser/editUser",
        context: {info:args.view.bindingContext.id}
    };

    frameModule.topmost().navigate(navigationEntry);
}


exports.goToLocation = function(){

    var navigationEntry = {
        moduleName:"views/location/location"
    };

    frameModule.topmost().navigate(navigationEntry);
}