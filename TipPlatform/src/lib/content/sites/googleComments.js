(function(exports){
    var pri = {},
        pub = {};

    pub.name = "googleComments";

    pub.updateMessage = function(message){
        $(".Oga").click();

        setTimeout(function(){
            var $div = $(".editable:first");

            $div.html(message);
        }, 700)
    };

    pub.initialize = function(){

        chrome.runtime.onMessage.addListener(function(request) {
            if (request.action == "updateGoogleComment") {
                pub.updateMessage(request.message);
            }
        });
    };

    exports.sites.googleComments = inherit(exports.sites.interface, pub);
})(RDD);