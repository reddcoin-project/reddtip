/**
 * Just listens for a message from the background script that will deliver the comment body to add to a comment.
 * This needs to be done because youtube comments are loaded in an iframe which is not accessible due to same origin
 * policy.
 */
(function(exports){
    var pri = {},
        pub = {};

    pub.name = "apisgoogle";

    pub.updateMessage = function(message){
        $(".Oga").click();

        setTimeout(function(){
            var $div = $(".editable:first");
            var $button = $(".d-k-l.b-c.b-c-Ba");

            $div.html(message);

            //despite best efforts, nothing seems to make the comment postable without a user keypress.
            $button.attr("aria-disabled", false);
            $button.attr("tab-index", "0");
            $button.removeClass("b-c-I");
        }, 1700)
    };

    pub.initialize = function(){

        chrome.runtime.onMessage.addListener(function(request) {
            if (request.action == "updateGoogleComment") {
                pub.updateMessage(request.message);
            }
        });
    };

    exports.sites.apisgoogle = inherit(exports.sites.interface, pub);
})(RDD);