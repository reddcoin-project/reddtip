
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