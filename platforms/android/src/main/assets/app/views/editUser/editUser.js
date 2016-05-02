var gotData;
var http = require("http");
var textFieldModule = require("ui/text-field");
var frameModule = require("ui/frame");

exports.pageLoaded = function(args){
    var page = args.object;
    gotData = page.navigationContext.info;
    var date = new Date();

    var url = "http://phpapialex.azurewebsites.net/getContact.php?id="+gotData;
    //console.log(url);

    http.getJSON(url).then(function (r) {
        // Argument (r) is JSON!
        var date2 = new Date();
        //console.log(date2);
        var test = date2.getTime()-date.getTime();
        var secondsDifference = test/1000;
        alert("time 1 gebruiker: " + secondsDifference );

        //console.log("got data");
        gotData = r[0];
        page.bindingContext = {user: gotData};
    }, function (e) {
        // Argument (e) is Error!
        console.log("error :s");
        //console.log(e);
    });
};

exports.onNavBtnTap = function () {

    var navigationEntry = {
        moduleName:"main-page"
    };
    frameModule.topmost().navigate(navigationEntry);
};

exports.update = function(){
    //console.log("update user",JSON.stringify(gotData));
    var date = new Date();

    http.request({
        url: "http://phpapialex.azurewebsites.net/updateContact.php",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        content:JSON.stringify({ id: gotData.id, first_name: gotData.first_name,last_name:gotData.last_name,email:gotData.email,gender:gotData.gender,ip_address:gotData.ip_address })
    }).then(function (response) {
        var date2 = new Date();
        //console.log(date2);
        var test = date2.getTime()-date.getTime();
        var secondsDifference = test/1000;
        alert("update gebruiker: " + secondsDifference );
        //console.log("gelukt");
        var navigationEntry = {
            moduleName:"main-page"
        };
        frameModule.topmost().navigate(navigationEntry);

    }, function (e) {
        console.log("Error occurred " + e);
    });
};

exports.remove = function(){
    //console.log("update user",JSON.stringify(gotData));
    var date = new Date();


    http.request({
        url: "http://phpapialex.azurewebsites.net/verwijderContact.php",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        content:JSON.stringify({ id: gotData.id })
    }).then(function (response) {
        var date2 = new Date();
        //console.log(date2);
        var test = date2.getTime()-date.getTime();
        var secondsDifference = test/1000;
        alert("remove 1 gebruiker: " + secondsDifference );

        //console.log("gelukt");
        var navigationEntry = {
            moduleName:"main-page"
        };
        frameModule.topmost().navigate(navigationEntry);

    }, function (e) {
        console.log("Error occurred " + e);
    });
};