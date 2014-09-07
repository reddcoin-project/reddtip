/**
 * RDD.operations
 */
(function(exports){
    var pri = {
            $tipUi: false,
            bindingsDone: false
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

    pri.isValidTip = function(value){
        if(RDD.tipKeywords[value] !== undefined){
            value = RDD.tipKeywords[value];
        }

        if(!isNaN(parseFloat(value))){
            return true;
        }
        return false;
    };

    pri.bind = function($tipUi){
        if(pri.bindingsDone === true){
            return true;
        }
        $("body").on("click", ".rddQuickTip", pri.doQuickTip);

        $("body").on("click", ".toggleQuickTipsButton", pri.toggleQuickTips);


        $("body").on("click", "#reddTipButton", function(e){
            e.preventDefault();
            var value = pub.getValue();

            $("#reddTipAmount").removeClass("error");

            if(pri.isValidTip(value)){
                exports.site.doTip();
                return;
            }

            $("#reddTipAmount").addClass("error");

        });

        pri.bindingsDone = true;
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
        //$('.reddTipUiState').hide("fast");
        $('.reddTipUiState').hide();
        $('.'+stateName+'State').show("fast");
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