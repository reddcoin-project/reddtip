(function(exports){
    var pri = {},
        pub = {};

    pub.name = "$NAME";

    pub.requiredHtmlSnippets = [
        "button"
    ];

    pri.buttonHtml = '';

    pri.prepareComment = function(message){
        exports.messenger.setYoutubeComment(message);
    };

    pub.getTippedUser = function(){
        var  userLink = $(".yt-user-info:first a").html();

        return userLink;
    };

    pub.hookTipDone = function(value, message){
        return pri.prepareComment(message);
    };

    pub.showTipUi = function(){
        var $container = $('<div></div>');
        this.addTipUi($container);
    };

    pub.adjustTipUi  = function($tipUi){
        $("#reddTipAmount", $tipUi).addClass();
        $("#reddTipButton", $tipUi).addClass();
        $(".toggleQuickTipsButton", $tipUi).addClass();
        $(".rddQuickTip", $tipUi).addClass();
        $("#reddAlertContainer", $tipUi).addClass();

        return $tipUi;
    };

    pub.addButtons = function(){
        $(".replaceSelector").after(pri.buttonHtml);

        $("body").on("click", ".tip", this.showTipUi);
    };

    pub.initialize = function(snippets){
        pri.buttonHtml    = snippets["button"];

        this.addButtons();
    };

    exports.sites.$NAME = inherit(exports.sites.interface, pub);
})(RDD);