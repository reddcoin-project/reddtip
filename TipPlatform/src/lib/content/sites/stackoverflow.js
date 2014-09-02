/**
 * Reddcoin Tip Platform
 * Site Implementation for: stackoverflow
 */
(function (exports) {
    var pri = {},
        pub = {};

    pub.name = "stackoverflow";

    pub.requiredHtmlSnippets = [
        "button"
    ];

    pri.buttonHtml = '';

    pri.prepareComment = function (message) {

    };

    pub.getTippedUser = function () {
        var userLink = $(".yt-user-info:first a").html();

        return userLink;
    };

    pub.hookTipDone = function (value, message) {
        return pri.prepareComment(message);
    };

    pub.showTipUi = function () {
        var $container = $('<div></div>');
        this.addTipUi($container);
    };

    pub.adjustTipUi = function ($tipUi) {
        $("#reddTipAmount", $tipUi).addClass();
        $("#reddTipButton", $tipUi).addClass();
        $(".toggleQuickTipsButton", $tipUi).addClass();
        $(".rddQuickTip", $tipUi).addClass();
        $("#reddAlertContainer", $tipUi).addClass();

        return $tipUi;
    };

    pub.addButtons = function () {
        $(".post-menu .lsep").filter(function(index){return (index % 2) === 0}).after(pri.buttonHtml);

        $("body").on("click", ".tip", this.showTipUi);
    };

    pub.initialize = function (snippets) {
        pri.buttonHtml = snippets["button"];

        this.addButtons();
    };

    exports.sites.stackoverflow = inherit(exports.sites.interface, pub);
})(RDD);