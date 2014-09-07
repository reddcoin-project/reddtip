/**
 * Reddcoin Tip Platform
 * Site Implementation for: instagram
 */
(function (exports) {
    var pri = {},
        pub = {};

    pub.name = "instagram";

    pub.requiredHtmlSnippets = [
        "button"
    ];

    pri.buttonHtml = '';
    pri.userName = '';
    pri.commentBox = {};

    pri.prepareComment = function (message) {
        exports.helpers.typeValue(pri.commentBox, message);
    };

    pub.getTippedUser = function () {
        return pri.userName;
    };

    pub.hookTipDone = function (value, message) {
        return pri.prepareComment(message);
    };

    pub.showTipUi = function ($tipLink) {
        var $container = $('<div class="newReddTip"></div>'),
            $timelineItem = $tipLink.closest('.timelineItem'),
            $userNameLink = $(".timelineBookmarkInfoUsername", $timelineItem);

        this.closeIfExists("slow", function(){ });

        if($("#reddTipUi", $tipLink.parent().parent()).length > 0){
            return;
        }

        pri.commentBox = $('.timelineCommentTextField', $timelineItem);
        pri.userName = $.trim($userNameLink.text());

        $tipLink.parent().after($container);
        $container.hide();

        this.addTipUi($container, function(){
            $container.show("slow");
        });
    };

    pub.adjustTipUi = function ($tipUi) {
        $("#reddTipButton", $tipUi).addClass("button");
        $(".rddQuickTip", $tipUi).addClass("button");

        return $tipUi;
    };

    pub.addButtons = function () {
        $(".timelineLikes").not(".tipAdded").addClass("tipAdded").prepend(pri.buttonHtml);
    };

    pub.initialize = function (snippets) {
        var that = this,
            bgimg = exports.helpers.url("img/icon16.png");

        pri.contentArea = $(".timelineContainer:first");
        pri.buttonHtml = snippets["button"].replace('{bgimg}', bgimg);

        this.pollElementSize(pri.contentArea, function(){
            that.addButtons();
        });

        $("body").on("click", ".tip", function(e){
            that.showTipUi($(this));
        });
    };

    exports.sites.instagram = inherit(exports.sites.interface, pub);
})(RDD);