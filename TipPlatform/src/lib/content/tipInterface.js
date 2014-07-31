/**
 * RDD.operations
 */
(function(exports){
    var pri = {
            $tipUi: false
        },
        pub = {};

    pri.doQuickTip = function(){
        var val = $(this).attr("data-tipValue");
        $("#reddTipAmount").val(val);
    };

    pri.toggleQuickTips = function(){
        var $button     = $(this),
            $container  = $(".extraQuickTips"),
            outerHeight = $(".rddQuickTip").first().outerHeight(true),
            finalHeight = outerHeight * 3;

        if($container.height() > 10){
            $container.animate({height : 0});
            $button.html("Show More");
            return;
        }

        $container.animate({height:finalHeight});
        $button.html("Show Less");
    };

    pri.bind = function($tipUi){
        $("body").on("click", ".rddQuickTip", pri.doQuickTip);

        $("body").on("click", ".toggleQuickTipsButton", pri.toggleQuickTips);


        $("body").on("click", ".tip", exports.site.showTipUi);
        $("body").on("click", "#reddTipButton", function(){
            exports.site.doTip();
        });
    };


    pri.getQuickButton = function(tipAmount){
        var html = '<a href="javascript:void(0);" class="rddQuickTip" data-tipValue="' + tipAmount + '">'
            + tipAmount.toLocaleString()
            + '</a>';
        return html;
    };

    pri.addQuickButtons = function($tipUi){
        var tipHtml   = '',
            extraHtml = '',
            count     = 0;

        $.each(RDD.tipList, function(i, tipAmount){

            if(count >= 20){
                extraHtml += pri.getQuickButton(tipAmount);
            }
            else {
                tipHtml   += pri.getQuickButton(tipAmount);
            }

            count++;
        });

        tipHtml = tipHtml + "<div class=\"extraQuickTips\">"+extraHtml+"</div>";

        $("#reddCoinTipContainer", $tipUi).empty().append(tipHtml);
    };

    pub.getValue = function(){
        return $("#reddTipAmount").val();
    };

    pub.setState = function(stateName){
        $('.reddTipUiState').hide();
        $('.'+stateName+'State').show();
    };

    pub.fetch = function(callback){
        exports.helpers.getLocalHtml('standard-tip-ui', function(tipUi){
            var $tipUi = $(tipUi);
            pri.addQuickButtons($tipUi);
            pri.bind($tipUi);
            pri.$tipUi = $tipUi;
            callback($tipUi);
        });
    };

    return exports.tipInterface = pub;
})(exports);