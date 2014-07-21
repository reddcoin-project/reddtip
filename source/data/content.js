
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
        tipBotUser : 'reddtipbot',
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
        500000,

        'beer',
        'champagne',
        'coffee',
        'all'
    ],

    tipKeywords: [
        'all',

        'upvote',
        'highfive',
        'coffee',
        'cookie',
        'gum',
        'burger',
        'donut',
        'sushi',
        'pizza',
        'souffle',
        'caviar',
        'beer',
        'nicebeer',
        'coke',
        'champagne',
        'wine',
        'hug',
        'kiss',
        'pi',
        'e'
    ],

    currentTextArea : false
};

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

/**
 * RDD.operations
 */
(function(exports){
    var pri = {},
        pub = {};

    pri.modHash = false;

    pri.requireModHash = function(callback){
        var extraData = {},

            getModHash = function(){
                $.getJSON('/api/me.json', function(response){
                    extraData.uh = response.data.modhash;
                    callback(extraData);
                });
            },

            showCaptcha = function(iden){
                exports.captcha.show(iden, function(userAnswer){
                    extraData.captcha = userAnswer;
                    getModHash();
                })
            },

            getCaptcha = function(){
                $.post('/api/new_captcha', {api_type:"json"}, function(response){
                    extraData.iden = response.json.data.iden;
                    showCaptcha(response.json.data.iden);
                })
            };

        $.get('/api/needs_captcha.json', function(response){
            if(response === true){
                getCaptcha();
            }
            else {
                getModHash();
            }
        });
    };

    pri.sendRedditMessage = function(subject, body, callback, to){
        var to = to || exports.vars.tipBotUser,
            callback = callback || function(){},
            data = {
                to      : to,
                subject : subject,
                text    : body
            };

        pri.requireModHash(function(extraData){
            data = $.extend({}, data, extraData);
            $.post('/api/compose', data, callback);
        });

    };

    pri.tryOperation = function(operation, callback){
        var list = exports.site.accountData.operationList,
            inProgress = list[operation] === true;

        dbg("Attempting operation: " + operation);

        if(inProgress){
            dbg("Aborting operation: " + operation);
            return;
        }

        callback();
    }

    pri.notifyOperationStarted = function(operation){
        var operationNotification = {
            method: "operationStarted",
            operation: operation
        };
        exports.helpers.message(operationNotification, function(operationList){
            exports.site.accountData.operationList = operationList;

        });
    };

    pub.updateBalance = function(){
        var operation = "updateBalance";

        RDD.captcha.setIntent("Check TipBot Balance");

        pri.tryOperation(operation, function(){

            $("#rddUpdateBalanceButton").hide();
            pri.notifyOperationStarted(operation);
            pri.sendRedditMessage("info", "+info");
        });
    };

    pub.register = function(){
        var operation = "registering";

        RDD.captcha.setIntent("Register with TipBot");

        pri.tryOperation(operation, function(){

            pri.notifyOperationStarted(operation);
            pri.sendRedditMessage("register", "+register", function(){
                exports.settingsGui.renderOperationProgress();
            });
        });
    };

    pub.updateHistory = function(){
        var operation = "updateHistory";

        RDD.captcha.setIntent("Update Transaction History");

        pri.tryOperation(operation, function(){

            $("#rddUpdateTransactionsButton").hide();
            pri.notifyOperationStarted(operation);
            pri.sendRedditMessage("history", "+history", function(){
                exports.settingsGui.renderOperationProgress();
            });

        });
    };

    pub.withdraw = function(toAddress, amount){
        var command = '+withdraw ' + toAddress + ' ' + amount + ' RDD';

        pri.sendRedditMessage("withdraw", command, function(){
            RDD.helpers.message({
                method : "withdrawalSent",
                address : toAddress,
                amount : amount
            });
        });
    };

    pub.withdrawGui = function(){
        var $address       = $("#reddWithdrawalAddress"),
            $amount        = $("#reddWithdrawalAmount"),
            toAddress      = $.trim($address.val()),
            amount         = $.trim($amount.val()),
            addressIsValid = /^[Rr][a-zA-Z0-9]{26,34}$/.test(toAddress),
            amountIsValid  = !isNaN(parseFloat(amount));

        if(!addressIsValid){
            $address.addClass("error");
        }
        else {
            $address.removeClass("error");
        }

        if(!amountIsValid){
            $amount.addClass("error");
        }
        else {
            $amount.removeClass("error");
        }

        if(!amountIsValid || !addressIsValid){
            return;
        }

        $("#rddDoWithdrawalButton").hide();
        $(".withdrawalInProgress").show();
        $("#reddWithdrawalAmount").val("");

        pub.withdraw(toAddress, amount);
    }

    //publish this module.
    exports.operations = pub;
})(RDD);

/*************************************************
 * RDD.settingsGUI
 *************************************************/
(function(exports){
    var pri = {
        transactionsRendered : false
        },
        pub = {};


    pri.setState = function(newState){
        $(".reddState").hide();
        $(".redd"+newState+"State").show();
    };

    pri.getTransactionHeader = function(){
        return '<table class="transactionTable"> ' +
            '<tr>' +
            '<th>Info</th>'+
            '<th>User</th>'+
            '<th>Amount</th>'+
            '<th>USD</th>'+
            '<th>Date</th>'+
            '</tr>';
    };

    pri.getAddressLink = function(address, length){
        var length = length || 12,
            shortened = address.substr(0,length) + '[...]',
            link = 'http://bitinfocharts.com/reddcoin/address/'+address;
        return '<a target="_blank" title="RDD Address: '+address+'" href="'+link+'">'+
            shortened
            +'</a>';
    }

    pri.getTransactionRow = function(transaction){
        var info,
            clss = "green",
            user = transaction.from,
            date = RDD.helpers.formatDay(new Date(transaction.time * 1000));

        switch(transaction.type){
            case "sent_tip":
                info = "Tip Sent To: ";
                user = transaction.to;
                break;
            case "received_tip":
                info = "Tip From: ";
                break;
            case "withdrawal":
                info = "Withdrawal to:";
                user = pri.getAddressLink(transaction.address);
                break;
        }

        if(transaction.amount < 0){
            clss = 'red';
        }

        return '<tr>' +
            '<td>' + info + '</td>'+
            '<td>' + user + '</td>'+
            '<td class="'+clss+'">' + transaction.amount + '</td>'+
            '<td>' + transaction.usd+ '</td>'+
            '<td>' + date + '</th>'+
            '</tr>';
    };

    pri.renderTransactions = function(){
        var request = {
            method    : "getDataAttribute",
            attribute : "recordedTransactions"
        };

        RDD.helpers.message(request, function(transactions){
            var html = pri.getTransactionHeader();

            $.each(transactions, function(i, transaction){
                html += pri.getTransactionRow(transaction);
            });

            html += '</table>'

            $("#rddTransactionsTable").html(html);
        });
    };

    pri.openTab = function($tabLink){
        var tab = $tabLink.attr("data-tab"),
            $tab = $("#reddTab_" + tab);

        if(tab === 'transactions' && ! pri.transactionsRendered){
            pri.renderTransactions();
            pri.transactionsRendered = true;
        }

        //hide others
        $(".reddSettingsTab").hide();
        $(".reddSettingsTabLink").removeClass("selected");

        $tab.show();
        $tabLink.addClass("selected")
    };

    pri.renderOperation = function(operationName, buttonId, messageId){
        var operationList = exports.site.accountData.operationList;

        //operationList[operationName] = true;
        if(operationList[operationName] === undefined){
            return;
        }

        if(operationList[operationName] === true){
            $(buttonId).hide();
            $(messageId).show();
        }
        else {
            $(buttonId).show();
            $(messageId).hide();
        }
    };

    pub.renderOperationProgress = function(){

        pri.renderOperation("updateBalance", "#rddUpdateBalanceButton",      ".balanceUpdateInProgress");
        pri.renderOperation("updateHistory", "#rddUpdateTransactionsButton", ".historyUpdateInProgress");
    };

    pub.bind = function(){
        $("#reddCoinBalanceLink").click(function(){
            pri.setState("Settings");
        });

        $("#reddSettingsBackButton").click(function(){
            pri.setState("Main");
        });

        $(".reddSettingsTabLink").click(function(){
            var $tabLink = $(this);
            pri.openTab($tabLink);
        });

        $(".reddSettingsTabLink:first").trigger("click");

        $("#rddUpdateBalanceButton").click(RDD.operations.updateBalance);
        $("#rddUpdateTransactionsButton").click(RDD.operations.updateHistory);
        $("#rddDoWithdrawalButton").click(RDD.operations.withdrawGui);
    };

    exports.settingsGui = pub;
})(RDD);


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
        RDD.modal.close();
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
        pri.vars.popup.fadeOut('fast', function(){
            $("#reddTipAmount").val("");
        });

        if(RDD.site.hookTipClose != undefined) {
            RDD.site.hookTipClose();
        }

    };

    pub.setInitialState = function(){
        $(".reddMainState").hide();
        $(".reddInitialState").show();
        $("#reddTipCancel").show();
        $("#reddCoinBalanceLink").hide();
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
            RDD.settingsGui.bind();

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

    formatDay: function(d){
        var m_names = new Array("Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oc", "Nov", "Dec");

        var curr_date = d.getDate();
        var curr_month = d.getMonth();
        return m_names[curr_month] + " " + curr_date;
    },

    message: function(data, callback){
        //ensure every request has the site and user available
        data.user = RDD.site.user;
        data.site = RDD.site.name;

        //if(RDD.helpers.isChrome()){
            chrome.runtime.sendMessage(data, callback);
        //}
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

    numberWithCommas: function(x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    },

    formatBalance: function(balance){
        balance = Math.floor(balance);
        balance = this.numberWithCommas(balance);
        return balance;
    },

    setPopupBalance: function(currentBalance){
        var initialBalance = currentBalance;
        if(currentBalance === false){
            currentBalance = "N/A";
            initialBalance = currentBalance;
        }
        else{
            currentBalance = this.formatBalance(currentBalance) + " RDD";
        }

        $("#rddFullBalance").html(initialBalance);
        $("#reddCoinBalanceLink").html(currentBalance);
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
    },

    //copied from reddit source.
    redditSource: {
        hidecomment: function(e){
            var t=$(e).thing();
            return t.hide().find(".noncollapsed:first, .midcol:first").hide().end().show().find(".entry:first .collapsed").show(),t.hasClass("message")?$.request("collapse_message",{id:$(t).thing_id()}):t.find(".child:first").hide(),!1
        },
        showcomment: function (e){
            var t=$(e).thing();
            return t.find(".entry:first .collapsed").hide().end().find(".noncollapsed:first, .midcol:first").show().end().show(),t.hasClass("message")?$.request("uncollapse_message",{id:$(t).thing_id()}):t.find(".child:first").show(),!1
        }
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

    name: "reddit",
    user: "",

    accountData : {
        currentBalance        : false,
        depositAddress        : false,
        lastWithdrawalAddress : false,
        operationList         : {}
    },

    buttonHtml : '<button class="tip" type="button">tip</button>',
    command    : '+/u/reddtipbot {AMOUNT} RDD',

    tipClicked : function(){

        // bind the show ui function to button click
        var input = $(this).closest('.usertext-edit').find('textarea');

        RDD.modal.open(function(tipAmount){
            var value = input.val() + '\n\n';

            value += RDD.helpers.getCommand(RDD.site.command, tipAmount)

            input.val(value);

            input.focus();
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

    minimizeBots: function(){
        //hide Reddtipbot messages
        var hideUsers = [
            'reddtipbot',
            'ReddcoinRewards'
        ];

        $(".noncollapsed .author").each(function(){
            //we only want to lookup $(this) once, for better performance.
            // Also, labeling it helps with readability
            var $userLink      = $(this),
                userName       = $userLink.text(),
                $parent;

            if($.inArray(userName, hideUsers) !== -1){

                $parent = $userLink.parents().eq(3);

                //only minimize visible bot comments, so that DOM updates are reduced a bit
                if($parent.find('.noncollapsed:first').is(':visible')) {

                    $parent.find('.noncollapsed:first, .midcol:first, .child:first').hide();
                    $parent.find('.collapsed:first').show();
                }
            }
        });
    },

    checkMessages: function(){

        $.getJSON('/message/inbox.json', function(response){
            RDD.helpers.message({ "method": "parseMessages", "response" : response }, function(){
                RDD.site.getAccountData();
            });
        });
    },

    initializeMessaging: function(){
        RDD.site.user = $("#header-bottom-right span.user:first a").html();


        RDD.helpers.message({ "method": "messageCheckNeeded" }, function(checkNeeded){
            if(checkNeeded){
                RDD.site.checkMessages();
            }
            else {
                RDD.site.getAccountData();
            }
        });
    },

    getAccountData: function(){
        RDD.helpers.message({ "method": "getAccountData" }, function(data){
            RDD.site.accountData = data;
            RDD.helpers.setPopupBalance(data.currentBalance);
            $("#reddDepositAddress").val(data.depositAddress);

            if(data.lastWithdrawalAddress !== false) {
                $("#reddWithdrawalAddress").val(data.lastWithdrawalAddress);
            }

            if(data.operationList.initialProbe === true && data.operationList.updateBalance === false){
                RDD.operations.updateBalance();
            }

            if(data.operationList.initialProbe || data.operationList.needsRegister){
                RDD.modal.setInitialState();
            }

            if(data.operationList.needsRegister === true && data.operationList.registering === false){
                RDD.modal.setInitialState();
                RDD.operations.register();
            }

            RDD.settingsGui.renderOperationProgress();

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

        //minimize comments from bots.
        RDD.site.minimizeBots();

        RDD.site.initializeMessaging();
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
