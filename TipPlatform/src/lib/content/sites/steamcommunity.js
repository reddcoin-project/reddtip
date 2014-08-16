/**
 * RDD.sites.steamcommunity
 */
(function (exports) {
    var pri = {
            tippedUser : '',
            lastHeight : 0,
            lastTipLink : false
        },
        pub = {};

    pri.waitingForIframe = false;

    pri.contentArea     = '';
    pri.buttonHtml      = '';
    pri.backgroundImage = '';

    pub.name = 'steamcommunity';
    pub.requiredHtmlSnippets = ["button"];


    pub.hookTipDone = function(value, message){
        dbg("tip done");
        var $commentBox = $(".commentthread_textarea");

        exports.helpers.typeValue($commentBox, message);
    };

    pub.hideTipUi = function(){

        dbg("hiding ui");
        var $container = $("#reddTipUi").parent();

        $container.hide("fast", function(){
            $container.empty().remove();
        });
    };

    pub.tipClicked = function(){

        if($("#reddTipUi").length > 0){

            this.hideTipUi();
            return;
        }

        this.showTipUi();
    };

    pub.bindTipButton = function(){
        var that = this;

        $("body").on("click", ".tip", function(){
            that.tipClicked();
        });

    };

    pub.showTipUi  = function(){
        dbg("showing ui");
        var $container = $("<div ></div>");

        $("#reddTipUi").parent().empty().remove();

        $(".commentthread_area").before($container);


        $container.hide();

        this.addTipUi($container, function(){
            $container.show('slow');
        });
    };

    pub.adjustTipUi = function($tipUi){
        $("#reddTipAmount", $tipUi).addClass('commentthread_textarea');
        $("#reddTipButton", $tipUi).addClass('general_btn');
        $("#reddCoinInputContainer", $tipUi).addClass('commentthread_entry_quotebox');
        $(".toggleQuickTipsButton", $tipUi).addClass('modalFullItemLink');
        $(".rddQuickTip", $tipUi).addClass('general_btn');

        return $tipUi;
    };

    pub.addButtons = function(){
        $(".apphub_CardRatingButtons").each(function(){
            var $div = $(this);
            if($(".tip", $div).length > 0){
                return;
            }

            $div.append(pri.buttonHtml);
        });

    };

    pub.expectTipOpen = function(){
        if(pri.waitingForIframe){
            pri.waitingForIframe = false;
            return true;
        }
        return false;
    };

    pub.getTippedUser = function(){
        return pri.tippedUser;
    };

    pub.initializeIframe = function(){
        var button = '' +
            '<span class="general_btn voteDown tip" style="background-image: url(' +
            pri.backgroundImage +
            ')">&nbsp;</span>',
            expectOpen = parent.RDD.site.expectTipOpen();
        $("#VoteDownBtn").after(button);

        this.bindTipButton();


        if(expectOpen){
            this.showTipUi();
        }
    };


    pub.initialize = function(snippets){
        var that = this,
            bgimg = exports.helpers.url("img/icon16.png");

        pri.contentArea = $("#AppHubCards");
        pri.buttonHtml = snippets["button"].replace('{bgimg}', bgimg);
        pri.backgroundImage = bgimg;

        if(exports.helpers.isIframe()){
            return this.initializeIframe();
        }

        this.pollElementSize(pri.contentArea, function(){
            that.addButtons();
        });

        pri.contentArea.on("click", ".tip", function(){
            pri.waitingForIframe = true;
        });


    };

    //publish this module.
    exports.sites.steamcommunity = inherit(exports.sites.interface, pub);
})(exports);






















