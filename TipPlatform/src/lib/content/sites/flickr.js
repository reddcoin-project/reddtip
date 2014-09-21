/**
 * Reddcoin Tip Platform
 * Site Implementation for: flickr
 */
(function (exports) {
    var pri = {},
        pub = {};

    pub.name = "flickr";

    pub.requiredHtmlSnippets = [
        "button",
        "smallButton",
        "popup"
    ];

    pri.commentLinkId = false;

    pri.userName = '';

    pri.buttonHtml = '';
    pri.popupHtml = '';

    pri.updateMessage = function(message){
        var $te = $("#message");

        if($te.length > 0){
            $te.val(message);
            return;
        }

        dbg("Couldn't find message target. Retrying.");

        setTimeout(function(){
            pri.updateMessage(message);
        }, 500)
    };

    pri.prepareComment = function (message) {
        $("#commentReddTip").click(function(e){
            e.preventDefault();
            $("#reddcoinFlickerPopup").empty().remove();

            exports.helpers.injectFunction(function(){
                document.getElementById("reddcoinFlickrCommentLink").click();
            })

            $("#reddcoinFlickrCommentLink").removeAttr("id");

            pri.updateMessage(message);
        });
    };

    pub.getTippedUser = function () {
        return pri.userName;
    };

    pub.hookTipDone = function (value, message) {
        return pri.prepareComment(message);
    };

    pub.showTipUi = function ($link) {
        var $container, href,
            that = this,
            linkAlreadyOpen = false,
            userLinkSelector = '.usernameLink',
            commentsSelector = '.il_comments',
            $imageContainer = $link.closest(".imgContainer");

        if($imageContainer.length === 0){
            $imageContainer = $link.closest(".hover-target");
            userLinkSelector = '.owner';
            commentsSelector = '.comments-icon';
        }

        if($("#reddcoinFlickerPopup", $imageContainer.parent()).length > 0){
            linkAlreadyOpen = true;
        }

        if($("#reddcoinFlickerPopup").length > 0){
            $("#reddcoinFlickerPopup").hide("fast", function(){
                $("#reddcoinFlickerPopup").empty().remove();

                if(!linkAlreadyOpen){
                    that.showTipUi($link);
                }
            });
            return;
        }

        href = $(userLinkSelector, $imageContainer).attr("href").split("/");

        pri.userName = href.pop();

        $imageContainer.after(pri.popupHtml);

        $container = $("#reddcoinFlickrContainer");

        this.addTipUi($container);

        //Comment Preparation
        $(commentsSelector, $imageContainer).attr("id", "reddcoinFlickrCommentLink");

    };

    pub.adjustTipUi = function ($tipUi) {
        $("#reddTipAmount", $tipUi).addClass();
        $("#reddTipButton", $tipUi).addClass("Butt");
        $(".toggleQuickTipsButton", $tipUi).addClass();
        $(".rddQuickTip", $tipUi).addClass("CancelButt");
        $("#reddAlertContainer", $tipUi).addClass();

        $("#reddAlertMessage", $tipUi).append("<a href=\"#\" id=\"commentReddTip\">Comment Now and Tell the World!</a>");

        return $tipUi;
    };

    pub.addButtons = function () {
        $(".imgLinks").not(".tipAdded").addClass("tipAdded").prepend(pri.buttonHtml);
        $(".inline-icons").not(".tipAdded").addClass("tipAdded").prepend(pri.smallButtonHtml);
    };

    pub.initialize = function (snippets) {
        var that = this,
            bgimg = exports.helpers.url("img/icon16.png");

        pri.smallButtonHtml = snippets["smallButton"].replace('{bgimg}', bgimg);
        pri.buttonHtml = snippets["button"].replace('{bgimg}', bgimg);
        pri.popupHtml = snippets["popup"];

        this.addButtons();

        $("body").on("click", ".tip", function(e){
            e.preventDefault();
            that.showTipUi($(this));
        });

        this.pollElementSize($("#photo-list-holder"), this.addButtons)
    };

    exports.sites.flickr = inherit(exports.sites.interface, pub);
})(RDD);