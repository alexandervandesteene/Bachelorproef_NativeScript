var http = require("http");
var frameModule = require("ui/frame");
var textFieldModule = require("ui/text-field");
//var firstname = "";
var user= {};
var time;

exports.pageLoaded = function(args){
    var page = args.object;

    time = page.navigationContext.date;

    var date2 = new Date();
    //console.log(date2);
    var test = date2.getTime()-time.getTime();
    var secondsDifference = test/1000;
    alert("change page: " + secondsDifference );

    user.first_name = "";
    user.last_name = "";
    user.email="";
    user.gender = "";
    user.ip_address = "";

    page.bindingContext = {user:user};
};

exports.onNavBtnTap = function(){
    var navigationEntry = {
        moduleName:"main-page"
    };
    frameModule.topmost().navigate(navigationEntry);
};

exports.saveUsers = function(){
    var date = new Date();

   // console.log("save user");
    //console.log("dfkmqfj",JSON.stringify(user));

    http.request({
        url: "http://phpapialex.azurewebsites.net/addContact.php",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        content:JSON.stringify({first_name: user.first_name,last_name:user.last_name,email:user.email,gender:user.gender,ip_address:user.ip_address })
    }).then(function (response) {

        var date2 = new Date();
        //console.log(date2);
        var test = date2.getTime()-date.getTime();
        var secondsDifference = test/1000;
        alert("add 1 gebruiker: " + secondsDifference );

        //console.log("gelukt");
        var navigationEntry = {
            moduleName:"main-page"
        };
        frameModule.topmost().navigate(navigationEntry);

    }, function (e) {
        console.log("Error occurred " + e);
    });
};