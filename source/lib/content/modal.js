
RDD.modal = (function(){
    var pri = {
            vars: {
                callback    : false,
                overlay     : false,
                popup       : false,
                requireUser : false
            }
        },

        pub = {};

    pri.doTip = function(){
        var tipAmount = $("#reddTipAmount").val(),
            tipUser = $.trim($("#reddTipUser").val()),
            float = parseFloat(tipAmount);

        if(isNaN(float) && $.inArray(tipAmount, RDD.tipKeywords) === -1){
            $("#reddTipAmount").addClass("error");
            return;
        }
        else {
            $("#reddTipAmount").removeClass("error");
        }

        if(pri.vars.requireUser && tipUser === ""){
            $("#reddTipUser").addClass("error");
            return;
        }
        else {
            $("#reddTipUser").removeClass("error");
        }

        //ensure @ sign
        if(tipUser.length > 0){
            if(tipUser.charAt(0) !== '@') {
                tipUser = '@'+tipUser;
            }
        }

        pri.vars.callback(tipAmount, tipUser);
        RDD.site.tipDone();
    }

    pri.buildModalHeader = function(){
        var headerSrc = RDD.helpers.url('/reddcoin_header_logo.png'),
            imgHtml = '<img id="reddCoinPopupImage" src="'+headerSrc+'">';

        $("#reddCoinPopupHeader").append(imgHtml);
    };

    pri.bindMainButtons = function(){

        //close on escape press
        $(document).keydown(function(e) {
            if (e.keyCode == 27) pub.close();
        });

        //close on cancel/container click
        $("#reddCoinPopupContainer").click(pub.close);
        $("#reddTipCancel").click(pub.close);

        //tip on enter press
        $(document).keydown(function(e) {
            if(e.keyCode == 13 && ($('#reddTipUser').is(':focus') || $('#reddTipAmount').is(':focus'))){
                pri.doTip();
            }
        });

        //tip on tip click
        $("#reddTipButton").click(function(){
            pri.doTip();
        });
    };

    pri.displayTabs = function(tabs){
        var tabs = tabs || RDD.site.tabs,
            $allTabs = $(".reddSettingsTabLink");

        $allTabs.hide();

        if(tabs.length === 1){
            return;
        }

        $.each($allTabs, function(i, item){
            var item = $(item),
                tab = item.attr("data-tab");
            if($.inArray(tab, tabs) > -1){
                item.show();
            }
        });
    };

    pri.addQuickButtons = function(){
        var tipHtml = '',
            extraHtml = '',
            count = 0;

        $.each(RDD.tipList, function(i, tipAmount){

            var a = ''
                + '<a href="javascript:void(0);" class="rddQuickTip" data-tipValue="' + tipAmount + '">'
                + tipAmount.toLocaleString()
                + '</a>';

            if(count >= 20){
                extraHtml += a;
            }
            else {
                tipHtml += a
            }

            count++;
        });

        tipHtml = tipHtml + "<div class=\"extraQuickTips\">"+extraHtml+"</div>";

        $("#reddCoinTipContainer").html(tipHtml);

        $(".rddQuickTip").click(function(){
            var val = $(this).attr("data-tipValue");
            $("#reddTipAmount").val(val);
            pri.doTip();
        });

        $(".toggleQuickTipsButton").click(function(){
            var $button = $(this),
                $container = $(".extraQuickTips");
            if($container.height() > 10){
                $container.animate({height:0});
                $button.html("Show More");
            }
            else {
                $container.animate({height:104});
                $button.html("Show Less");
            }
        })
    };

    pub.open = function(callback, showUser, requireUser, tabs){
        var $userInput = $("#reddTipUser");

        pri.vars.callback = callback;
        pri.vars.requireUser = requireUser || false;

        if(showUser){
            $userInput.show();
        }
        else {
            $userInput.hide();
        }

        pri.displayTabs(tabs);

        pri.vars.overlay.fadeIn('fast');
        pri.vars.popup.fadeIn('slow', function(){
            //if the current site hooks the dialog open event, call it.
            if(RDD.site.hookTipOpen != undefined) {
                RDD.site.hookTipOpen();
            }

            //focus input
            $("#reddTipAmount").focus();

            if(showUser){
                $("#reddTipUser").focus();
            }
        });

        RDD.settingsGui.openTab($(".reddSettingsTabLink:visible:last"));

        pri.vars.popup.css('top', '60px');
    };

    pub.close = function(){
        pri.vars.overlay.fadeOut('slow');
        pri.vars.popup.fadeOut('fast', function(){
            $("#reddTipAmount").val("");
        });

        if(RDD.site.hookTipClose != undefined) {
            RDD.site.hookTipClose();
        }

    };

    pub.setInitialState = function(){
        this.setState("Initial");
//        $(".reddMainState").hide();
//        $(".reddInitialState").show();
//        $("#reddTipCancel").show();
        $("#reddCoinBalanceLink").hide();
    };

    pub.setState = function(newState){
        $(".reddState").hide();
        $(".redd"+newState+"State").show();
    };

    pub.initialize = function(){

        RDD.helpers.getPopupHtml(function(html){
            var win = {
                height : $(window).height(),
                width  : $(window).width()
            };

            $(html).appendTo("body");

            //store the jquery objects we'll need frequently
            pri.vars.overlay = $("#reddCoinPopupContainer");
            pri.vars.popup   = $("#reddCoinPopup");

            //make the overlay take up the entire window
            pri.vars.overlay.height(win.height);

            pri.vars.popup.width(RDD.vars.modalWidth);
            pri.vars.popup.offset({
                top: 50,
                left: (win.width - RDD.vars.modalWidth) / 2
            });

            pri.buildModalHeader();
            pri.addQuickButtons();
            pri.bindMainButtons();
            pri.displayTabs();
            //pub.setState("Settings");
            RDD.settingsGui.bind();

        });
    }

    //return the public object to expose global functions.
    return pub;
})()