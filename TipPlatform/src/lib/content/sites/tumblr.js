/**
 * Reddcoin Tip Platform
 * Site Implementation for: tumblr
 */
(function (exports) {
    var pri = {},
        pub = {};

    pub.name = "tumblr";

    pub.requiredHtmlSnippets = [
        "button"
    ];

    pri.buttonHtml = '';
    pri.userName = '';

    pub.getTippedUser = function () {
        return pri.userName;
    };

    pub.showTipUi = function ($tipLink) {
        var $container = $('<div></div>'),
            $containerSibling = $tipLink.closest(".post_footer");

        this.closeIfExists("slow", function(){ });

        if($("#reddTipUi", $containerSibling.parent()).length > 0){
            return;
        }

        $containerSibling.before($container);
        $container.hide();

        pri.userName = $(".post_info_link:first", $containerSibling.closest(".post_wrapper")).text();
        pri.userName = $.trim(pri.userName);

        this.addTipUi($container,function(){
            $container.show("slow");
        });
    };

    pub.adjustTipUi = function ($tipUi) {
        $("#reddTipButton", $tipUi).addClass("chrome blue");
        $(".toggleQuickTipsButton", $tipUi).addClass("post_header");
        $(".toggleQuickTipsButton", $tipUi).attr("href", "#");
        $(".rddQuickTip", $tipUi).addClass("chrome flat");
        $(".rddQuickTip", $tipUi).attr("href", "#");
        $("#reddAlertContainer", $tipUi).addClass();

        return $tipUi;
    };

    pub.addButtons = function () {
        $(".post_controls_inner").not(".hasTip").addClass("hasTip").prepend(pri.buttonHtml);
    };

    pub.initialize = function (snippets) {
        var that = this,
            bgimg = exports.helpers.url("img/icon16.png");

        pri.contentArea = $("#posts");
        pri.buttonHtml = snippets["button"].replace('{bgimg}', bgimg);

        this.pollElementSize(pri.contentArea, function(){
            that.addButtons();
        });

        $("body").on("click", ".tip", function(){
            that.showTipUi($(this));
        });
    };

    exports.sites.tumblr = inherit(exports.sites.interface, pub);
})(RDD);