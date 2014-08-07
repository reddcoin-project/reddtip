/**
 * RDD.sites.facebook
 */
(function (exports) {
    var pri = {
            tippedUser : '',
            lastHeight : 0,
            lastTipLink : false,

            contentArea : false
        },
        pub = {};

    pri.buttonHtml = '';

    pub.name = 'plusgoogle';


    pub.hookTipDone = function(value, message){
        var $commentBox,
            $commentContainer = pri.lastTipLink.parent().parent();
        $(".Dt.wu", $commentContainer).click();

        setTimeout(function(){
            $commentBox =  $(".editable", $commentContainer);
            $commentBox.html(message);
            $commentBox.trigger("keyup");
            $commentBox.trigger("keydown");
            $commentBox.trigger("keypress");
            //exports.helpers.typeValue($commentBox, message);
        }, 600);
    };

    pub.showTipUi  = function($tipLink){
        var $parent = $tipLink.parent(),
            $container = $("<div class=\"Cx fr\"></div>"),
            $fullItemContainer = $parent.parent(),
            $nameLink = $('header h3 a', $fullItemContainer);

        pri.lastTipLink = $tipLink;

        pri.tippedUser = $nameLink.html();

        $("#reddTipUi").parent().empty().remove();

        $parent.after($container);


        $container.hide();

        this.addTipUi($container, function(){
            $container.prepend('<div class="Ar vt"></div>');
            $("#reddTipUi").addClass('uiUfi UFIContainer _5pc9 _5vsj _5v9k');
            $container.show('fast');
        });
    };

    pub.adjustTipUi = function($tipUi){
        var secondaryButton = 'd-k-l b-c b-c-R b-c-da-ja',
            button          = 'd-k-l b-c b-c-Ba b-c-da-ja',
            input           = 'wu';

        //UFIRow UFILikeSentence UFIFirstComponent
        $("#reddTipAmount", $tipUi).addClass(input);
        $("#reddTipButton", $tipUi).addClass(button);
        $(".toggleQuickTipsButton", $tipUi).addClass('d-s vy');
        $(".rddQuickTip", $tipUi).addClass(secondaryButton);

        return $tipUi;
    };

    pub.addButtons = function(){
        $('div.Dg.Ut').each(function(){
            var $shareLink = $(this);

            if($shareLink.siblings(".tip").length > 0){
                return;
            }

            $shareLink.after(pri.buttonHtml);
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

        pri.contentArea = $("#contentPane");

        pri.contentArea.on("click", ".tip", function(){
            that.showTipUi($(this));
        });

        exports.helpers.loadMultiHtml("plusgoogle/button", function(response){
            var bgimg = exports.helpers.url("img/bw_icon16.png")
            pri.buttonHtml = response["plusgoogle/button"].replace('{bgimg}', bgimg);
            pub.pollHeightChanges();
        });

    };

    //publish this module.
    exports.sites.plusgoogle = inherit(exports.sites.interface, pub);
})(exports);