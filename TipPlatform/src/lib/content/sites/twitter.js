(function(exports){
    var pri = {},
        pub =  {};

    pub.buttonHtml = '<button class="btn primary-btn tip-action tip-btn js-tip-btn" type="button">\
	<span class="button-text tip-text">\
		Tip\
	</span>\
</button>';
    pub.command    = ' @tipreddcoin +tip {RECIPIENT} {AMOUNT} RDD';
    pub.commandMsg = '+tip  {AMOUNT} RDD';
    pub.currentUser = false;
    pub.lastTextArea = false;

    pub.hookTipClose= function(){
        if(RDD.site.lastTextArea !== false){
            var text = RDD.site.lastTextArea.text();

            RDD.site.lastTextArea.text(text.replace(/^\.\s*/, ""));
        }
    };

    pub.hookTipOpen = function(){
        var currentUser = $(".profile-card-inner").attr("data-screen-name");

        if(RDD.site.currentUser !== false){
            currentUser = RDD.site.currentUser;
        }

        if(currentUser){
            currentUser = currentUser.replace("@", "");
            $("#reddTipUser").val("@" + currentUser);
        }
    };

    pub.tipClicked = function(){
        var button = $(this),
            isMessage = button.closest('.tweet-button').find('.tweet-btn').find('.messaging-text').is(':visible'),
            textArea = button.closest('form').find('.tweet-box'),
            showUser = false,
            initialText = $.trim(textArea.text()),
            usernameRegex = /^\s*@[-a-zA-Z0-9_]+\s*$/,
            matches = usernameRegex.exec(initialText),
            requireUser = false;

        //reset the global-ish current user
        RDD.site.currentUser = false;
        RDD.site.lastTextArea = textArea;

        if(!isMessage) {
            showUser = true;
            requireUser = true;
        }

        // This is super hacky but I couldn't figure out a better way. Essentially, if the user hasn't entered any text
        // when they click tip, twitter will change the textarea to a placeholder mode and not recognize it as having
        // any actual content. For now we add a period and remove it later. Better solution needed for sure.
        if(initialText === "" || matches){
            textArea.text(". ");
            textArea.trigger("keyup");
        }

        if(matches){
            RDD.site.currentUser = matches[0];
        }

        RDD.modal.open(function(tipAmount, tipUser){
            var text = textArea.text();

            if(isMessage) {
                text += RDD.helpers.getCommand(RDD.site.commandMsg, tipAmount, tipUser)
            }
            else {
                text += RDD.helpers.getCommand(RDD.site.command, tipAmount, tipUser);
            }

            text = text.replace(/^\.\s*@tipreddcoin/, "@tipreddcoin");
            text = text.replace(/^\.\s*\+tip/, "+tip");

            textArea.text( text );
            textArea.trigger("keyup");
        }, showUser, requireUser);
    };

    pub.addButtons = function(){
        // Add buttons to tweets
        $('.tweet-button').append(RDD.site.buttonHtml);
        $('.tip-btn').css('height', '37px');

        // Now fix the height of the buttons and fix the onclick function (add tip)
        //twitterFixButtons ();


        $("body").on("click", ".tip-btn", RDD.site.tipClicked);
    };

    pub.initialize = function(){
        RDD.site.addButtons();
    };

    exports.sites.twitter = inherit(exports.sites.interface, pub);;
})(RDD);