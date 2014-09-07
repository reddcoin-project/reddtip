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

    pri.userName = '?';
    pri.itemContainer = false;
    pri.hideContainer = false;

    pub.prepareComment = function(message){
        var $commentBox, $commentLink, index;

        // this stuff is a bit weird. For whatever reason we can't trigger jQuery events in our own context, need to do
        // it in actual page context.
        // Solution? Inject script into their page.

        // Step 1: Get the link
        $commentLink = $(".js-add-link.comments-link", pri.itemContainer);

        // Step 2: find its index in the context of all similar links
        index = $(".js-add-link.comments-link").index($commentLink);

        // Step 3: Inject a function that triggers the click :)
        exports.helpers.injectFunction(function(index){
            jQuery(".js-add-link.comments-link")[index].click();
        }, [index]);

        //that should focus the text area for us.
        $commentBox =  $(":focus");

        exports.helpers.typeValue($commentBox, message);
        setTimeout(function(){
            exports.helpers.injectFunction(function(){
                $commentBox =  jQuery(":focus");
                $commentBox.trigger("keyup");
                $commentBox.trigger("keypress");
            })
        }, 1920)
    };

    pub.getTippedUser = function () {
        return pri.userName;
    };

    pub.hookTipDone = function (value, message) {
        return this.prepareComment(message);
    };

    pub.showTipUi = function ($tipLink) {
        var $container = $('<div></div>'),
            $wholeAnswer = $tipLink.closest(".question"),
            $containerSibling;

        if($wholeAnswer.length === 0){
            $wholeAnswer = $tipLink.closest(".answer")
        }

        $containerSibling = $(".comments", $wholeAnswer)

        pri.hideContainer = false;
        if($containerSibling.is(":hidden")){
            pri.hideContainer = true;
            $containerSibling.show();
        }

        this.closeIfExists("slow", function(){
            if(pri.hideContainer){
                $containerSibling.hide();
            }
        });

        if($("#reddTipUi", $containerSibling).length > 0){
            return;
        }

        pri.itemContainer = $wholeAnswer;

        $containerSibling.prepend($container);
        $container.hide();

        pri.userName = $.trim($(".user-details:last a:first", $wholeAnswer).text());

        this.addTipUi($container,function(){
            $container.show("slow");
        });
    };

    pub.adjustTipUi = function ($tipUi) {
        $("#reddTipButton", $tipUi).addClass('button');
        $(".toggleQuickTipsButton", $tipUi).addClass('comments-link');

        return $tipUi;
    };

    pub.addButtons = function () {
        var that = this;
        $(".post-menu .lsep").filter(function(index){return (index % 2) === 0}).after(pri.buttonHtml);

        $("body").on("click", ".tip", function(){

            that.showTipUi($(this));
        });
    };

    pub.initialize = function (snippets) {
        pri.buttonHtml = snippets["button"];

        this.addButtons();
    };

    exports.sites.stackoverflow = inherit(exports.sites.interface, pub);
})(RDD);