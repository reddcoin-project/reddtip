
/**
 * Originally based on the userscript "Reddcoin QuickTip" by Jacce
 * http://userscripts.org/scripts/show/406551?3
 *
 * Ported to a chrome plugin by:
 * Andy Groff (andy@groff.co)
 * http://groff.co
 *
 */

function dbg(variable)
{
    console.log(variable);
}


var RDD = {

    vars : {
        modalWidth: 450
    },

    tipList: [
        50,
        100,
        200,
        500,

        1000,
        2000,
        5000,
        10000,

        25000,
        50000,
        100000,
        500000
    ],

    currentTextArea : false
}


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

        if(isNaN(float)){
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
        RDD.modal.close();
    }

    pri.buildModalHeader = function(){
        var headerSrc = RDD.helpers.url('/reddcoin_header_logo.png'),
            imgHtml = '<img id="reddCoinPopupImage" src="'+headerSrc+'">';

        $("#reddCoinPopupHeader").html(imgHtml);
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

    pri.addQuickButtons = function(){
        var tipHtml = '';

        $.each(RDD.tipList, function(i, tipAmount){

            var a = ''
                  + '<a href="javascript:void(0);" class="rddQuickTip" data-tipValue="' + tipAmount + '">'
                  + tipAmount.toLocaleString()
                  + '</a>';

            tipHtml += a
        });

        $("#reddCoinTipContainer").html(tipHtml);

        $(".rddQuickTip").click(function(){
            var val = $(this).attr("data-tipValue");
            $("#reddTipAmount").val(val);
            pri.doTip();
        });
    };

    pub.open = function(callback, showUser, requireUser){
        var $userInput = $("#reddTipUser");

        pri.vars.callback = callback;
        pri.vars.requireUser = requireUser || false;

        if(showUser){
            $userInput.show();
        }
        else {
            $userInput.hide();
        }

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
        pri.vars.popup.css('top', '60px');
    };

    pub.close = function(){
        pri.vars.overlay.fadeOut('slow');
        pri.vars.popup.fadeOut('fast');
        $("#reddTipAmount").val("");

        if(RDD.site.hookTipClose != undefined) {
            RDD.site.hookTipClose();
        }
//        pri.vars.popup.fadeOut('fast', function(){  
//            $("#reddTipAmount").val("");
//        });
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
        });
    }

    //return the public object to expose global functions.
    return pub;
})()

RDD.helpers = {

    isChrome: function(){
        try {
            if(chrome) {
                return true;
            }
        } catch(e) {}

        return false;
    },

    getPopupHtml: function(callback){

        if(RDD.helpers.isChrome()){
            $.get(RDD.helpers.url('popup.html'), function(html){
                callback(html);
            });
            return;
        }

        callback(self.options.popupHtml)
    },

    url: function(path){

        if(RDD.helpers.isChrome()){
            return chrome.extension.getURL('data/' + path);
        }

        var str = self.options.baseUrl;
        str = str.substring(0, str.length - 1)
        return str + path;

    },

    getCommand: function(command, amount, user){
        command = command.replace('{AMOUNT}', amount);

        if(user !== undefined){
            command = command.replace('{RECIPIENT}', user);
        }

        return command;
    },

    getCurrentSite: function(){
        var domain = document.domain;

        switch (domain){
            case 'www.twitter.com':
            case 'twitter.com':
                return 'twitter';

            case 'www.reddit.com':
            case 'reddit.com':
                return 'reddit';

            case 'www.twitch.tv':
            case 'twitch.tv':
                return 'twitch';
        }

        return false;
    }
}

/**
 * This will hold the current site.
 *
 */
RDD.site = {};

/**
 * This holds all the available sites.
 *
 */
RDD.sites = {};

RDD.sites.reddit = {

    buttonHtml : '<button class="tip" type="button">tip</button>',
    command    : '+/u/reddtipbot {AMOUNT} RDD',

    tipClicked : function(){

        // bind the show ui function to button click
        var input = $(this).closest('.usertext-edit').find('textarea');

        RDD.modal.open(function(tipAmount){
            var value = input.val() + '\n\n';

            value += RDD.helpers.getCommand(RDD.site.command, tipAmount)

            input.val(value);
        });
    },

    addButtons : function(){
        // Add buttons for all areas where there should be one
        $('.usertext-buttons').each(function(){
            var $tipButton;

            //make sure there's not already a tip button here.
            if ($(this).find('.tip').length == 0)
            {
                //create button
                $tipButton = $(RDD.site.buttonHtml);

                //append the tip button
                $(this).find('.cancel').after($tipButton);
            }
        });
    },

    initialize: function(){

        //add initial buttons
        RDD.site.addButtons();

        // bind clicks on reply to also add a button
        $('.noncollapsed > .flat-list > li').each(function(){
            var text = $.trim($(this).text()).toLowerCase();

            if(text === 'reply') {
                $(this).click(RDD.site.addButtons);
            }
        });

        //bind to body click, filter for .tip buttons
        $("body").on("click", ".tip", RDD.site.tipClicked);
    }
};



RDD.sites.twitter = {

    buttonHtml : '<button class="btn primary-btn tip-action tip-btn js-tip-btn" type="button">\
	<span class="button-text tip-text">\
		Tip\
	</span>\
</button>',
    command    : ' @tipreddcoin +tip {RECIPIENT} {AMOUNT} RDD',
    commandMsg : '+tip  {AMOUNT} RDD',
    currentUser : false,
    lastTextArea : false,

    hookTipClose: function(){
        if(RDD.site.lastTextArea !== false){
            var text = RDD.site.lastTextArea.text();

            RDD.site.lastTextArea.text(text.replace(/^\.\s*/, ""));
        }
    },

    hookTipOpen : function(){
        var currentUser = $(".profile-card-inner").attr("data-screen-name");

        if(RDD.site.currentUser !== false){
            currentUser = RDD.site.currentUser;
        }

        if(currentUser){
            currentUser = currentUser.replace("@", "");
            $("#reddTipUser").val("@" + currentUser);
        }
    },

    tipClicked : function(){
        var button = $(this),
            isMessage = button.closest('.tweet-button').find('.tweet-btn').find('.messaging-text').is(':visible'),
            textArea = button.closest('form').find('.tweet-box'),
            showUser = false,
            initialText = $.trim(textArea.text()),
            usernameRegex = /@[-a-zA-Z0-9_]+/,
            matches = usernameRegex.exec(initialText),
            requireUser = false;

        //reset the global-ish current user
        RDD.site.currentUser = false;
        RDD.site.lastTextArea = textArea;

        if(!isMessage) {
            showUser = true;
            requireUser = true;
        }

        // This is super hacky but I couldn't figure out a better way. Essentially, is the user hasn't entered any text
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
    },

    addButtons : function(){
        // Add buttons to tweets
        $('.tweet-button').append(RDD.site.buttonHtml);
        $('.tip-btn').css('height', '37px');

        // Now fix the height of the buttons and fix the onclick function (add tip)
        //twitterFixButtons ();


        $("body").on("click", ".tip-btn", RDD.site.tipClicked);
    },

    initialize: function(){
        RDD.site.addButtons();
    }
};

RDD.sites.twitch = {

    buttonHtml : '<button class="button primary_button tip" style="padding: 1.5px;width: 22%;">Tip</button>',
    command    : '@tipreddcoin +tip {RECIPIENT} {AMOUNT} RDD',

    tipClicked : function(){
        var textArea = $(this).closest('.chat-interface').find('textarea');

        RDD.modal.open(function(tipAmount, tipUser){
            var text = textArea.val()

                text += RDD.helpers.getCommand(RDD.site.command, tipAmount, tipUser);

            textArea.val( text );
        }, true, false);
    },

    addButtons : function(){
        // Add a button to the Twitch chat
        $('.send-chat-button').append(RDD.site.buttonHtml);
        $('.send-chat-button button:first').css("width", "75%");

        $("body").on("click", ".tip", RDD.site.tipClicked);
    },

    checkWidth : function (waitTime)
    {
        // Don't start the script until the page has been loaded correctly
        if ($('.send-chat-button button:first').width() > 120)
        {
            RDD.site.addButtons();
        }
        else if (waitTime <= 4096)
        {
            setTimeout(function(){
                RDD.site.checkWidth(waitTime * 2);
            }, waitTime);
        }
    },

    initialize: function(){
        if ($('.chat-option-buttons').length != 0)
        {
            RDD.site.checkWidth(16);
        }
    }
};


$(function(){

    var site = RDD.helpers.getCurrentSite();

    //early exit. The site wasn't resolved correctly.
    if(site === false) {
        dbg("site not found");
        return;
    }

    //set the current site
    RDD.site = RDD.sites[site];

    //initialiaze the modal dialogue
    RDD.modal.initialize();

    //initialize the current site.
    RDD.site.initialize();

});
