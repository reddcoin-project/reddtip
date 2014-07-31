(function(exports){
    var pri = {},
        pub = {};


    pub.buttonHtml = '<button class="button primary tip" style="margin-right: 10px;width: 22%;">Tip</button>';
    pub.command    = '@tipreddcoin +tip {RECIPIENT} {AMOUNT} RDD';

    pub.tipClicked = function(){
        var textArea = $(this).closest('.chat-interface').find('textarea');

        RDD.modal.open(function(tipAmount, tipUser){
            var text = textArea.val()

            text += RDD.helpers.getCommand(RDD.site.command, tipAmount, tipUser);

            textArea.val( text );
        }, true, false);
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
        if ($('.chat-option-buttons').length != 0)
        {
            RDD.site.checkWidth(16);
        }
    };

    exports.sites.twitch = inherit(exports.sites.interface, pub);
})(RDD);