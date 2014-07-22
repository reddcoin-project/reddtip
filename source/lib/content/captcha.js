
(function(exports){
    var pri = {
            iden: false,
            currentIntent : false
        },
        pub = {};

    pri.getHtml = function(){
        var extraText = "";
        if(pri.currentIntent !== false){
            extraText = ': ' + pri.currentIntent;
        }
        pri.currentIntent = false;

        var html = '<div id="rddCaptcha">' +
            '<h4>Robot Test' + extraText + '</h4>' +
            '<p>' +
            'Unfortunately you need to solve a captcha for us to communicate with the tipbot. ' +
            '</p>' +
            '<p>' +
            'Alternatively, you can submit something to earn enough karma to skip these.' +
            '</p>' +
            '<img src="/captcha/'+pri.iden+'"> <br>' +
            '<input type="text" id="rddCapchaAnswer" placeholder="captcha solution">  <br>' +
            '<div class="rddCaptchaButton">'+
            '<button id="rddCaptchaCancel">Cancel</button> ' +
            '<button id="rddCaptchaDone">Done</button>' +
            '</div>'+
            '</div>';

        return html;
    };

    pri.matchMainPopup = function(){
        var $main = $("#reddCoinPopup"),
            $captcha = $("#rddCaptcha"),
            mainPos = $main.offset(),
            offset = 60;

        if(mainPos.left < 100){
            mainPos.left = ($(window).width() / 2) - 410
        }

        $captcha.offset({
            top  : mainPos.top + offset,
            left : mainPos.left
        });
        $captcha.height($main.height() - offset);
        $captcha.width($main.width() - 40);
    };

    pub.setIntent = function(intent){
        pri.currentIntent = intent;
    };

    pub.show = function(iden, completeCallback){
        pri.iden = iden;
        $("body").append(pri.getHtml());
        $("#reddCoinPopupContainer").show();
        pri.matchMainPopup();

        $("#rddCaptchaDone").click(function(){
            var answer = $("#rddCapchaAnswer").val();

            $("#rddCaptcha").remove();

            if(!$("#reddCoinPopup").is(":visible")){
                $("#reddCoinPopupContainer").hide();
            }

            completeCallback(answer);
        });

        $("#rddCaptchaCancel").click(function(){
            if(!$("#reddCoinPopup").is(":visible")){
                $("#reddCoinPopupContainer").hide();
            }

            $("#rddCaptcha").remove();
        });
    };

    exports.captcha = pub;
})(RDD);