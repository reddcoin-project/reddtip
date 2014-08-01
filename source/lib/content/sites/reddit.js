(function(exports){
    var pri = {},
        pub = {};

    pub.name = "reddit";
    pub.user = "";

    pub.accountData = {
        currentBalance        : false,
        depositAddress        : false,
        lastWithdrawalAddress : false,
        operationList         : {}
    };

    pub.tabs = [
        "tip",
        "transactions",
        "balance",
        "withdrawal",
        "settings"
    ];

    pub.buttonHtml = '<button class="tip" type="button">tip</button>';
    pub.command    = '+/u/reddtipbot {AMOUNT} RDD';

    pub.tipClicked = function(){

        // bind the show ui function to button click
        var input = $(this).closest('.usertext-edit').find('textarea');

        RDD.modal.open(function(tipAmount){
            var value = input.val() + '\n\n';

            value += RDD.helpers.getCommand(RDD.site.command, tipAmount)

            input.val(value);

            input.focus();
        });
    };

    pub.addButtons = function(){
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
    };

    pub.minimizeBots = function(){
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
    };

    pub.checkMessages = function(callback){
        var callback = callback || function(){};

        $.getJSON('/message/inbox.json', function(response){
            RDD.helpers.message({ "method": "parseMessages", "response" : response }, function(){
                RDD.site.getAccountData();
                callback();
            });
        });
    };

    pub.initializeMessaging = function(canCheck){
        var canCheck = canCheck || true;
        RDD.site.user = $("#header-bottom-right span.user:first a").html();


        RDD.helpers.message({ "method": "messageCheckNeeded" }, function(checkNeeded){
            if(checkNeeded && canCheck){
                RDD.site.checkMessages();
            }
            else {
                RDD.site.getAccountData();
            }
        });
    };

    pub.getAccountData = function(){
        RDD.helpers.message({ "method": "getAccountData" }, function(data){
            RDD.site.accountData = data;
            RDD.helpers.setPopupBalance(data.currentBalance);
            $("#reddDepositAddress").val(data.depositAddress);

            if(data.lastWithdrawalAddress !== false) {
                $("#reddWithdrawalAddress").val(data.lastWithdrawalAddress);
            }

            if(data.operationList.initialProbe === true && data.operationList.updateBalance === false){
                //RDD.operations.updateBalance();
            }

            if(data.operationList.initialProbe || data.operationList.needsRegister){
                RDD.modal.setInitialState();
            }

            if(data.operationList.needsRegister === true && data.operationList.registering === false){
                RDD.modal.setInitialState();
                //RDD.operations.register();
            }

            RDD.settingsGui.renderOperationProgress();
            RDD.settingsGui.renderSettings(data.settings);

            if(data.settings.hideBotComments === true){

                //minimize comments from bots.
                RDD.site.minimizeBots();
            }
        });
    };

    pub.bindHotKey = function(){
        var tabs = $.extend([], RDD.site.tabs);
        tabs.shift();
        document.onkeydown = function (evt){
            if (!evt) evt = event;
            if (evt.altKey && evt.keyCode === 84){ //CTRL+ALT+F4

                RDD.modal.open(function(){}, false, false, tabs);
            }
        }
    };

    pub.initialize = function(){
        var isComments = /reddit.com.+\/comments\//.test(document.URL);

        RDD.site.bindHotKey();

        if(!isComments){
            RDD.site.initializeMessaging(false);
            return;
        }

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

        RDD.site.initializeMessaging();
    };

    exports.sites.reddit = inherit(exports.sites.interface, pub);;
})(RDD);