/**
 * Reddcoin Tip Platform
 * Site Implementation for: twitch
 */
(function (exports) {
    var pri = {},
        pub = {};

    pub.name = "twitch";

    pub.requiredHtmlSnippets = [
        "button"
    ];

    pri.userName = '';
    pri.buttonHtml = '';

    pri.prepareComment = function (message) {
        message = message.replace("you", '@'+pri.userName);
        $(".textarea-contain textarea").val(message);
    };

    pub.getTippedUser = function () {
        return pri.userName;
    };

    pub.hookTipDone = function (value, message) {
        return pri.prepareComment(message);
    };

    pub.showTipUi = function ($link) {
        var $container = $('<div class="newReddTip interface"></div>'),
            $card = $link.closest(".moderation-card");

        this.closeIfExists("fast");

        //pri.userName = $.trim($("h3.name", $card).text());

        $link.parent().after($container);

        $container.hide();

        this.addTipUi($container, function(){
            $container.show("fast");
        });
    };

    pub.adjustTipUi = function ($tipUi) {
        $("#reddTipAmount", $tipUi).addClass();
        $("#reddTipButton", $tipUi).addClass("button primary");
        $(".toggleQuickTipsButton", $tipUi).addClass();
        $(".rddQuickTip", $tipUi).addClass();
        $("#reddAlertContainer", $tipUi).addClass();

        return $tipUi;
    };

    pub.addButtons = function () {
        var $card = $(".moderation-card:visible");
        $('.interface button:first', $card).not(".tipAdded").addClass("tipAdded").after(pri.buttonHtml)
    };

    pub.initialize = function (snippets) {
        var that = this;
        pri.buttonHtml = snippets["button"];

        this.addButtons();

        $(".tse-scroll-content").on("click", ".ember-view .from", function(){
            pri.userName = $(this).text()
            setTimeout(that.addButtons, 500);
        });

        $("body").on("click", ".tip", function(){
            that.showTipUi($(this));
        });
    };

    exports.sites.twitch = inherit(exports.sites.interface, pub);
})(RDD);