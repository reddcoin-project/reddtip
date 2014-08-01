(function(exports){
    var pri = {},
        pub = {};

    pub.name = "youtube";
    pub.user = "";

    pub.accountData = {
        currentBalance        : false,
        depositAddress        : false,
        lastWithdrawalAddress : false,
        apiUser               : {},
        operationList         : {}
    };

    pub.buttonHtml = '<span>' +
        '<button class="tip yt-uix-button yt-uix-button-size-default yt-uix-button-text action-panel-trigger yt-uix-tooltip yt-uix-button-toggled" type="button" onclick=";return false;" title="" >' +
        '<span class="yt-uix-button-content">Tip</span>' +
        '</button>' +
        '</span>';
    pub.command    = '';

    pri.tryAddButton = function(response){
        if(response.issue){
            return;
        }

        $("#watch7-secondary-actions").append(pub.buttonHtml);
    }

    pri.loadUser = function(){
        var message = {
            method : "initiateApi"
        };
        exports.helpers.message(message, function(){

        });
    };

    pub.tipClicked = function(){
        var textArea = $(this).closest('.chat-interface').find('textarea');

        RDD.modal.open(function(tipAmount, tipUser){
            var text = textArea.val()

            text += RDD.helpers.getCommand(RDD.site.command, tipAmount, tipUser);

            textArea.val( text );
        });
    };

    pub.hookTipOpen = function(){
        $("#reddCoinPopup").css("position", "fixed");
    };
    pub.addButtons = function(){
        // Add a button to the Twitch chat
        $('.send-chat-button').append(RDD.site.buttonHtml);
        //$('.send-chat-button button:first').css("width", "75%");

        $("body").on("click", ".tip", RDD.site.tipClicked);
    };

    pub.checkWidth = function (waitTime){
        var $button = $('.send-chat-button button:first'),
            width = $button.width();

        // Don't start the script until the page has been loaded correctly
        if (width > 20)
        {
            dbg("Adding buttons.");
            RDD.site.addButtons();
        }
        else if (waitTime <= 44096)
        {
            dbg("twitch waiting...");
            setTimeout(function(){
                RDD.site.checkWidth(waitTime * 2);
            }, waitTime);
        }
    };

    pub.initialize = function(){
        return;
        var userLink = $(".yt-user-info:first").html(),
            style = exports.helpers.url("styles.css"),
            id = /"\/channel\/([^"]+)/.exec(userLink) || ["?", "?"],
            stylsheet = '<link rel="stylesheet" type="text/css" href="'+style+'">';

        $('head').append(stylsheet);

        $("body").on("click", ".tip", RDD.site.tipClicked);

        pri.loadUser();

        //return;
        var url = RDD.vars.addressApi,
            request = {
                method    : "getUserAddress",
                channelId : id[1]
            };

        $.getJSON(url, request, pri.tryAddButton);

        return;

    };

    exports.sites.youtube = inherit(exports.sites.interface, pub);
})(RDD);