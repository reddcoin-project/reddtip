/**
 * Reddcoin Tip Platform
 * Site Implementation for: disqus
 */
(function (exports) {
    var pri = {},
        pub = {};

    pub.name = "disqus";

    pub.requiredHtmlSnippets = [
        "button"
    ];

    pri.commentContainer = '';
    pri.userName = '';
    pri.buttonHtml = '';

    pri.prepareComment = function (message) {

    };

    pub.getTippedUser = function () {
        return pri.userName;
    };

    pub.hookTipDone = function (value, message) {
        exports.helpers.injectFunction(function(){
            document.getElementById("disqusReddcoinComment").click();
        })

        $("#disqusReddcoinComment").removeAttr("id");

        setTimeout(function(){
            $("div.textarea:visible", pri.commentContainer).html("<p>"+message+"</p>");
        }, 800)
        return pri.prepareComment(message);
    };

    pub.showTipUi = function ($link) {
        var userLink,
            $postBody = $link.closest(".post-body"),
            $container = $('<div class="newReddTip"></div>');

        this.closeIfExists("fast");

        if($("#reddTipUi", $postBody.parent()).length > 0){
            return;
        }

        $postBody.after($container);

        userLink = $(".author a", $postBody);

        pri.userName = userLink.text() + " (" + userLink.attr("data-user") + ")";
        $("li.reply a", $postBody).attr("id", "disqusReddcoinComment");

        pri.commentContainer = $link.closest(".post-content");


        this.addTipUi($container);
        $container.hide();
        $container.show("fast");
    };

    pub.adjustTipUi = function ($tipUi) {
        $("#reddTipAmount", $tipUi).addClass("textarea-wrapper");
        $("#reddTipButton", $tipUi).addClass("btn");
        $(".toggleQuickTipsButton", $tipUi).addClass();
        $(".rddQuickTip", $tipUi).addClass("btn");
        $("#reddAlertContainer", $tipUi).addClass();

        return $tipUi;
    };

    pub.addButtons = function () {
        $("li.reply").not(".tipAdded").addClass("tipAdded").after(pri.buttonHtml);
    };

    pub.tryButtons = function(){
        if($("li.reply").length === 0){
            setTimeout(function(){
                pub.tryButtons();
            }, 600);

            return;
        }

        setTimeout(function(){
            pub.addButtons();
        }, 600)

    };

    pub.initialize = function (snippets) {
        var that = this;
        if(document.URL.indexOf("embed/comments") < 1){
            return;
        }
        pri.buttonHtml = snippets["button"];

        pub.tryButtons();

        $("body").on("click", ".tip", function(e){
            e.preventDefault();
            that.showTipUi($(this));
        });
    };

    exports.sites.disqus = inherit(exports.sites.interface, pub);
})(RDD);