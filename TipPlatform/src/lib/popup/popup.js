
/**
 * RDD.popup
 */
(function(exports){
    var pri = {
            isFullPageMode : false,
            transactionsRendered : false
        },
        bitcore = require('bitcore'),
        pub = {};

    pri.notification = function(message, seconds, speed){
        var $div = $("#popupNotificationDiv"),
            s = speed || 'slow',
            waitTime = seconds || 1;

        $div.text(message);

        $div.fadeIn(s, function(){
            setTimeout(function(){
                $div.fadeOut(s);
            }, waitTime * 1000);

        })
    };

    pri.doQuickPay = function(query){
        $("body").addClass("quickpay");
        $(".reddSettingsTab").hide();
        $("#reddTab_withdrawal").show();

        $("#sendAddress").val(query.address);
        $("#sendAmount").val(query.amount);
        $("#sendLabel").val(query.label);

        pri.isFullPageMode = true;
    };

    pri.sendGui = function(){
        var $address       = $("#sendAddress"),
            $amount        = $("#sendAmount"),
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



        exports.messenger.sendTransaction(amount, toAddress, function(){
            $("#sendAmount").val("");
            $("#sendLabel").val("");
            $("#sendAddress").val("");

            pri.notification("Transaction is being broadcast.");

            if(pri.isFullPageMode){
                setTimeout(function(){
                    window.close();
                }, 4000);
            }
        });
    };

    pri.checkTipableSite = function(){
        var tabQuery = {currentWindow : true, active : true},
            method = {method : "hasTip"},
            setTip = function(data){
                pri.openTab($(".reddSettingsTabLink.send"));
                $("#sendLabel").val(data.address);
                $("#sendAddress").val(data.domain);

                pri.notification("`" + data.domain + "` Accepts Reddcoin Donations.", 3);
            };

        chrome.tabs.query(tabQuery, function (tabs) {
            var tabId = tabs[0].id;

            chrome.tabs.sendMessage(tabId, method, function (response) {
                if (response && response.hasTip) {
                    setTip(response);
                }
            });
        });
    };


    pri.renderTransactions = function(transactions){
        //define the function to do the rendering
        var render = function(transactions){
            var html = exports.transactionsView.getView(transactions);
            console.log(transactions);
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
        exports.messenger.getWalletTransactions(function(transactions){
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

    pri.copyAddress = function($row){
        var addr = $row.attr("data-address"),
            oldOncopy = document.oncopy;
        document.oncopy = function(event) {
            event.clipboardData.setData('text/plain', addr);
            event.preventDefault();
        };
        document.execCommand("Copy", false, null);

        document.oncopy = oldOncopy;
        pri.notification("Address Copied to Clipboard.");
    };

    pri.renderAddresses = function(addresses, containerSelector){
        var $container = $(containerSelector),
            header = '';

        header += '<div class="row header">';
        header += '<div class="grid_15">---</div>';
        header += '<div class="grid_60">Address</div>';
        header += '<div class="grid_25">RDD</div>';
        header += '</div>';

        $container.empty();
        $container.append(header);
        addresses.forEach(function(address){
            var html = '',
                val = bitcore.util.formatValue(address.confirmed);

            val = exports.helpers.htmlRound(val);

            html += '<div class="row" data-name="'+address.name+'" data-address="'+address.address+'">';

            html += '<div class="grid_15">';
            html += '<i class="fa fa-files-o fa-lg" title="Copy Address"></i>&nbsp;&nbsp;';
            html += '<i class="fa fa-edit fa-lg" title="Rename"></i>';
            html += '</div>';


            html += '<div class="grid_60 addressContainer">';
            html += address.name;
            html += '</div>';

            html += '<div class="grid_25 align-right">';
            html += val;
            html += '</div>';

            html += '</div>';

            $container.append(html);
        });
    };

    pri.renderWalletData = function(data){
        var balance = Math.floor(data.totalBalance);
            balance = exports.helpers.numberWithCommas(balance);

        pri.renderAddresses(data.addresses, '#myAddressList');
        $("#reddCoinBalanceLink").html(balance + " RDD");
        $("#rddFullBalance").html(data.totalBalance);
        $("#rddConfirmedBalance").html(data.confirmedBalance);
        $("#rddUnconfirmedBalance").html(data.unconfirmedBalance);
    };

    pri.setState = function(current){
        $(".reddState").hide();
        $(".redd" + current + "State").show();
    };

    pri.walletDataLoaded = function(data){
        if(data.addresses.length > 0){
            pri.setState("Settings");
            pri.renderWalletData(data);
            pri.checkTipableSite();
        }
    };

    pri.bindDev = function(){

        $("#devDeposit").click(function(){
            exports.messenger.addDeposit(5000);
        });

        $("#clearData").click(function(){
            exports.messenger.clearData();
        });
    };

    pub.updateInterface = function(data){
        pri.renderWalletData(data.interfaceData);

        if(pri.transactionsRendered){
            pri.renderTransactions(data.transactions);
        }
    };

    pub.bind = function(){
        var tabSelector = ".reddSettingsTabLink",
            query = exports.helpers.getQueryVariables();

        if(query.hasOwnProperty("address")){
            pri.doQuickPay(query);
        }

        $("#reddCoinPopupImage").attr("src", exports.helpers.url('img/reddcoin_header_logo.png'));

        if(!pri.isFullPageMode){

            $(tabSelector).click(function(){
                pri.openTab($(this));
            });

            pri.openTab($(tabSelector + ":last"));
        }

        pri.bindDev();

        $("#doSendButton").click(pri.sendGui);
        $("#reddTipCancel").click(function(){
            window.close();
        });

        $("#myAddressList").on("click", '.fa-files-o', function(){
            pri.copyAddress($(this).closest(".row"));
        });

        pri.setState("Setup");



        exports.messenger.getWalletData(pri.walletDataLoaded);
    };

    //publish this module.
    exports.popup = pub;
})(exports);

//Janky. I know...
$(function(){
    RDD.popup.bind();
});