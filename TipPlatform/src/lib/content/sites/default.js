/**
 * Reddcoin Tip Platform
 * Site Implementation for: default / all sites
 */
(function (exports) {
    var pri = {
            tipAddress : '',
            hasTip     : false
        },
        pub = {};

    pub.name = "default";

    pub.requiredHtmlSnippets = [];

    pri.checkMetaTags = function () {
        $("meta").each(function () {
            var $meta = $(this),
                name = $meta.attr("name");

            if (name == 'reddcoin:address') {
                pri.hasTip = true;
                pri.tipAddress = $meta.attr("content");
            }
        });
    };

    pri.doLinkPayment = function (href) {
        var query = href.replace('reddcoin:', '');

        query = '?address=' + query.replace('?', '&');

        exports.messenger.newTab('/data/html/popup.html' + query);

    };

    pub.initialize = function () {

        $("body").on("click", "a", function (e) {
            var href = $(this).attr("href");
            if (href.indexOf('reddcoin:') === 0) {
                e.preventDefault();
                pri.doLinkPayment(href);
            }
        });

        pri.checkMetaTags();
    };

    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
        if (request.method && request.method == "hasTip") {
            sendResponse({
                hasTip : pri.hasTip,
                address: pri.tipAddress,
                domain : exports.helpers.getCurrentSite(true)
            });
        }
    });

    exports.sites.default = inherit(exports.sites.interface, pub);
})(RDD);