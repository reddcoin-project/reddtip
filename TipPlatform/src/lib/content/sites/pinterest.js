/**
 * Reddcoin Tip Platform
 * Site Implementation for: pinterest
 */
(function (exports) {
    var pri = {},
        pub = {};

    pub.name = "pinterest";

    pub.requiredHtmlSnippets = [
        "button",
        "bigButton",
        "modal"
    ];

    pri.userName = '?';
    pri.buttonHtml = '';
    pri.bigButtonHtml = '';
    pri.modalHtml = '';

    pri.prepareComment = function (message) {
        var $textArea = $(".addCommentForm textarea");

        if($textArea.length == 0){
            return;
        }

        exports.helpers.typeValue($textArea, message);
    };

    pub.getTippedUser = function () {
        return pri.userName;
    };

    pub.hookTipDone = function (value, message) {
        $(".modalTip", "#reddcoinPinterestModal").hide();
        return pri.prepareComment(message);
    };

    pri.findPostOwner = function($button){
        var $wrapper = $button.closest(".pinWrapper"),
            $userLink = $(".creditItem a:first", $wrapper),
            userName = false,
            userUri;

        if($userLink.length === 0){
            $userLink = $(".UserBase:first a", '.closeupContainer');
        }
        if($userLink.length === 0){
            //$userLink = $(".UserBase:first a");
        }

        userUri = $userLink.attr("href");

        if(!userUri){
            pri.userName = '?';
            return false;
        }

        $.each(userUri.split("/"), function(i, item){
            var current = $.trim(item);
            if(userName === false && current.length > 0){
                userName = current;
            }
        });

        pri.userName = userName;
    };

    pub.showTipUi = function ($button) {
        var $container;

        pri.findPostOwner($button);

        $("body").append(pri.modalHtml);

        $container = $("#reddcoinModalTipPinterest")

        this.addTipUi($container);

        $("#reddcoinPinterestModal").on("click", ".cancelButton", function(e){
            $("#reddcoinPinterestModal").empty().remove();
        });

        $("#reddcoinPinterestModal").on("click", ".modalTip", this.externalDoTip);
    };

    pub.adjustTipUi = function ($tipUi) {
        var $message = $("#reddAlertMessage", $tipUi);

        $(".rddQuickTip", $tipUi).addClass("rounded Button hasText Module btn");

        if($(".addCommentForm textarea").length > 0){
            $message.html($message.html() + " Comment below to share it!");
        }


        return $tipUi;
    };

    pub.addButtons = function () {
        $(".likeEditButtonWrapper").not(".tipAdded").addClass("tipAdded").prepend(pri.buttonHtml);
        $(".repinLike").not(".tipAdded").addClass("tipAdded").prepend(pri.bigButtonHtml);
    };

    pub.initialize = function (snippets) {
        var that = this,
            bgimg = exports.helpers.url("img/icon16.png");

        pri.contentArea = $(".mainContainer");
        pri.buttonHtml = snippets["button"].replace('{bgimg}', bgimg);
        pri.bigButtonHtml = snippets["bigButton"].replace('{bgimg}', bgimg);
        pri.modalHtml = snippets["modal"];

        this.pollElementSize(pri.contentArea, function(){
            that.addButtons();
        });

        this.pollElementChildren($(".appendedContainer"), function(){
            that.addButtons();
        });

        $("body").on("click", ".bigTip, .smallTip", function(e){
            that.showTipUi($(this));
        });
    };

    exports.sites.pinterest = inherit(exports.sites.interface, pub);
})(RDD);