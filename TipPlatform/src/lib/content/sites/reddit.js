(function(exports){
    var pri = {},
        pub = {};

    pub.name = "reddit";

    pub.requiredHtmlSnippets = [
        "button"
    ];

    pri.commentLink = false;

    pri.userName = '';

    pri.buttonHtml = '';

    pri.prepareComment = function(message){
        $("textarea", pri.commentLink.closest(".thing")).val(message);
    };

    pub.getTippedUser = function(){
        return pri.userName;
    };

    pub.hookTipDone = function(value, message){

        exports.helpers.clickElementNatively(pri.commentLink);

        return pri.prepareComment(message);
    };

    pub.showTipUi = function($link){
        var $container = $('<div class="newReddTip"></div>'),
            $sibling = $link.closest(".entry"),
            //dont judge me, reddit labels it a "thing"
            $thing = $sibling.parent(),
            thisOneOpen = $("#reddTipUi", $thing).length > 0;

        this.closeIfExists("fast",function(){})

        if(thisOneOpen){
            return;
        }

        pri.commentLink = $('li a[onclick="return reply(this)"]', $sibling);

        pri.userName = $(".author", $thing).text();

        $sibling.after($container);
        this.addTipUi($container);
    };

    pub.adjustTipUi  = function($tipUi){
        $("#reddTipAmount", $tipUi).addClass();
        $("#reddTipButton", $tipUi).addClass();
        $(".toggleQuickTipsButton", $tipUi).addClass();
        $(".rddQuickTip", $tipUi).addClass();
        $(".rddQuickTip", $tipUi).each(function(){
            var html = $(this).html();
            $(this).html("<button type='button'>"+html+"</button>");
        });
        $("#reddAlertContainer", $tipUi).addClass();

        return $tipUi;
    };

    pub.addButtons = function(){
        $(".flat-list.buttons li.report-button").not(".tipAdded").addClass("tipAdded").next().after(pri.buttonHtml);
    };

    pub.initialize = function(snippets){
        var that = this;
        pri.buttonHtml    = snippets["button"];

        this.pollElementSize($(".commentarea"), function(){
            that.addButtons();
        });

        $("body").on("click", ".tip", function(e){
            that.showTipUi($(this));
        });

    };

    exports.sites.reddit = inherit(exports.sites.interface, pub);
})(RDD);