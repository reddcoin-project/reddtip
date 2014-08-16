(function(exports){
    var pri = {},
        pub = {};

    pub.name = "youtube";

    pub.requiredHtmlSnippets = [
        "button",
        "panel",
        "alertIcon"
    ];

    pri.buttonHtml = '';
    pri.panelHtml = '';
    pri.alertIconHtml = '';


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
        var googleSelectedClass = "yt-uix-button-toggled";
        $('.'+googleSelectedClass).removeClass(googleSelectedClass);
        $(".tip.yt-uix-button").addClass(googleSelectedClass);
    };

    pub.adjustTipUi  = function($tipUi){
        var $message = $("#reddAlertMessage", $tipUi);

        $("#reddTipAmount", $tipUi).addClass("yt-uix-form-input-text share-panel-url");
        $("#reddTipButton", $tipUi).addClass("yt-uix-button yt-uix-button-size-large yt-uix-button-primary");
        $(".toggleQuickTipsButton", $tipUi).addClass("yt-uix-button yt-uix-button-size-default yt-uix-button-text toggle-button");
        $(".rddQuickTip", $tipUi).addClass("yt-uix-button yt-uix-button-size-default yt-uix-button-text");
        $("#reddAlertContainer", $tipUi).addClass('yt-alert yt-alert-actionable yt-alert-success');
        $("#reddAlertContainer", $tipUi).prepend(pri.alertIconHtml);

        $message.html($message.html() + " Comment below to share it!");
        $message.prepend('<span class="yt-alert-vertical-trick"></span>');
        $message.addClass("yt-alert-content yt-alert-message");
        return $tipUi;
    };

    pub.addButtons = function(){
        var $panel = $(pri.panelHtml),
            $container = $(".tip-panel", $panel);

        $("#watch7-secondary-actions span:nth-child(2)").after(pri.buttonHtml);

        $("#action-panel-share").after($panel);

        $("#action-panel-tip").hide();

        $("body").on("click", ".tip", this.showTipUi);
        this.addTipUi($container);
    };

    pub.initialize = function(snippets){
        pri.buttonHtml    = snippets["button"];
        pri.panelHtml     = snippets["panel"];
        pri.alertIconHtml = snippets["alertIcon"];

        this.addButtons();
    };

    exports.sites.youtube = inherit(exports.sites.interface, pub);
})(RDD);