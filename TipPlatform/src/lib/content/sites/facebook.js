/**
 * RDD.sites.facebook
 */
(function (exports) {
    var pri = {
            tippedUser : '',
            lastHeight : 0,
            contentArea : false
        },
        pub = {};

    pub.name = 'facebook';

    pub.showTipUi  = function($tipLink){
        var $parent = $tipLink.parent().parent(),
            $container = $("<div></div>"),
            $fullItemContainer = $parent.closest('.userContentWrapper'),
            $nameLink = $('span.fwb a', $fullItemContainer);

        pri.tippedUser = $nameLink.html();

        $("#reddTipUi").empty().remove();

        $parent.after($container);

        this.addTipUi($container, function(){
            $("#reddTipUi").addClass('uiUfi UFIContainer _5pc9 _5vsj _5v9k');
        });
    };

    pub.adjustTipUi = function($tipUi){
        var secondaryButton = '_42ft _4jy0 layerCancel  uiOverlayButton _4jy3 _517h',
            button          = '_42ft _4jy0 uiOverlayButton _4jy3 _4jy1 selected',
            input           = 'textInput mentionsTextarea',
            container       = 'uiUfi UFIContainer _5pc9 _5vsj _5v9k';

        //UFIRow UFILikeSentence UFIFirstComponent
        $("#reddTipAmount", $tipUi).addClass(input);
        $("#reddTipButton", $tipUi).addClass(button);
        $(".tipState", $tipUi).addClass('UFIRow UFILikeSentence UFIFirstComponent');
        $(".rddQuickTip", $tipUi).addClass(secondaryButton);

        return $tipUi;
    };

    pub.addButtons = function(){
        $('.comment_link').each(function(){
            var $commentLink = $(this);

            if($commentLink.siblings(".tip").length > 0){
                return;
            }

            $commentLink.after(' · <a class="tip">Tip</a>');
        });

    };

    pub.getTippedUser = function(){
        return pri.tippedUser;
    };

    pub.pollHeightChanges = function(){
        var that = this,
            height = pri.contentArea.height();

        if(height > pri.lastHeight){
            this.addButtons();
            pri.lastHeight = height;
        }

        setTimeout(function(){
            that.pollHeightChanges();
        }, 2000);
    };

    pub.initialize = function(){
        var that = this;
        exports.helpers.appendStylesheet('standard-tip-ui');

        pri.contentArea = $("#contentArea");

        pri.contentArea.on("click", ".tip", function(){
            that.showTipUi($(this));
        });

        pub.pollHeightChanges();

        window.onerror = function(){
            return false;
        }

    };

    //publish this module.
    exports.sites.facebook = inherit(exports.sites.interface, pub);
})(exports);