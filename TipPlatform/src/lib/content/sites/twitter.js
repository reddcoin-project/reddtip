(function (exports) {
    var pri = {},
        pub = {};

    pub.name = "twitter";

    pub.requiredHtmlSnippets = [
        "button"
    ];

    pri.commentLink = false;
    pri.userName = '?';
    pri.buttonHtml = '';

    pri.prepareComment = function (message) {
        var $textArea = $("#tweet-box-template");
        $textArea.html('<div>@'+pri.userName+' '+message+'</div>');
    };

    pub.getTippedUser = function () {
        return pri.userName;
    };

    pub.hookTipDone = function (value, message) {
        exports.helpers.clickElementNatively(pri.commentLink);
        return pri.prepareComment(message);
    };

    pub.showTipUi = function ($link) {
        var $sibling = $link.closest(".stream-item-footer"),
            $container = $('<div class="newReddTip"></div>'),
            $tweetContent = $sibling.closest(".tweet"),
            thisOneOpen = $("#reddTipUi", $tweetContent).length > 0;


        this.closeIfExists("fast",function(){})

        if(thisOneOpen){
            return;
        }

        pri.commentLink = $(".js-action-reply", $tweetContent);
        pri.userName = $(".js-user-profile-link", $tweetContent).attr("href");
        pri.userName = pri.userName.substr(1,pri.userName.length);

        $sibling.after($container);
        $container.hide();
        this.addTipUi($container, function(){
            $container.show("fast");
        });

    };

    pub.adjustTipUi = function ($tipUi) {
        $("#reddTipAmount", $tipUi).addClass();
        $("#reddTipButton", $tipUi).addClass("primary-btn btn");
        $(".toggleQuickTipsButton", $tipUi).addClass();
        $(".rddQuickTip", $tipUi).addClass("btn");
        $("#reddAlertContainer", $tipUi).addClass();

        return $tipUi;
    };

    pub.addButtons = function () {
        $(".tweet-actions.js-actions").not(".tipAdded").addClass("tipAdded").prepend(pri.buttonHtml);


    };

    pub.initialize = function (snippets) {
        var that = this,
            bgimg = exports.helpers.url("img/icon16.png");


        pri.buttonHtml = snippets["button"].replace('{bgimg}', bgimg);

        this.pollElementSize($('.home-stream'), function(){
            that.addButtons();
        });

        $(".stream-container").on("click", ".reddTipUi", function(e){
            var node = e.target.nodeName;
            if(node !== "A" && node !== "BUTTON"){
                e.stopPropagation();
            }
        });

        $("body").on("click", ".tip", function(e){
            e.preventDefault();
            that.showTipUi($(this));
        });
    };

    exports.sites.twitter = inherit(exports.sites.interface, pub);
})(RDD);