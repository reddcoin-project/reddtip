
/**
 * RDD.popup
 */
(function(exports){
    var pri = {
            transactionsRendered : false
        },
        pub = {};


    pri.withdrawGui = function(){
        var $address       = $("#reddWithdrawalAddress"),
            $amount        = $("#reddWithdrawalAmount"),
            toAddress      = $.trim($address.val()),
            amount         = $.trim($amount.val()),
            addressIsValid = /^[Rr][a-zA-Z0-9]{26,34}$/.test(toAddress),
            amountIsValid  = !isNaN(parseFloat(amount));

        $address.removeClass("error");

        if(!addressIsValid){
            $address.addClass("error");
        }

        $amount.removeClass("error");

        if(!amountIsValid){
            $amount.addClass("error");
        }

        if(!amountIsValid || !addressIsValid){
            return;
        }

        $("#rddDoWithdrawalButton").hide();
        $(".withdrawalInProgress").show();
        $("#reddWithdrawalAmount").val("");

        exports.messenger.addWithdrawal(amount, toAddress, function(){
            $(".withdrawalInProgress").hide();
            $("#rddDoWithdrawalButton").show();
        });

        exports.messenger.withdrawalSent(toAddress);
    }


    pri.renderTransactions = function(transactions){
        //define the function to do the rendering
        var render = function(transactions){
            var html = exports.transactionsView.getView(transactions);
            $("#rddTransactionsTable").html(html);
        };

        // set transactions equal to false if not provided
        transactions = transactions || false;

        // if transactions provided, render them and exit
        if(transactions !== false){
            render(transactions);
            return;
        }

        //transactions not provided. Fetch then render.
        exports.messenger.getDataAttribute("recordedTransactions", function(transactions){
            render(transactions);
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

    pri.renderAccountData = function(data){
        $("#reddDepositAddress").val(data.depositAddress);
        $("#reddWithdrawalAddress").val(data.lastWithdrawalAddress);
        $("#reddCoinBalanceLink").html(data.currentBalance + " RDD");
        $("#rddFullBalance").html(data.currentBalance);
    };

    pri.accountDataLoaded = function(data){
        pri.renderAccountData(data);
    };

    pri.bindDev = function(){

        $("#devDeposit").click(function(){
            exports.messenger.addDeposit(5000);
        });

        $("#clearData").click(function(){
            exports.messenger.clearData();
        });
    };

    pub.dataSaved = function(data){
        //dbg(data);
        pri.renderAccountData(data);

        if(pri.transactionsRendered){
            pri.renderTransactions(data.recordedTransactions);
        }
    };

    pub.bind = function(){
        var tabSelector = ".reddSettingsTabLink";

        $(tabSelector).click(function(){
            pri.openTab($(this));
        });

        pri.openTab($(tabSelector + ":last"));

        pri.bindDev();

        $("#rddDoWithdrawalButton").click(pri.withdrawGui);

        exports.messenger.getAccountData(pri.accountDataLoaded);
    };

    //publish this module.
    exports.popup = pub;
})(exports);

//Janky. I know...
$(function(){
    RDD.popup.bind();
});