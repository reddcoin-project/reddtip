exports.wallet = (function () {
    var pri = {
            wallet  : false,
            monitor : false
        },
        pub = {},
        listener = {},
        electrum = require('electrum'),
        bitcore = require('bitcore');

    listener.dataReceived = function(data){
        var popupWindow = chrome.extension.getViews({type:'popup'})[0];

        if(popupWindow){
            popupWindow.RDD.popup.updateInterface({
                interfaceData : pub.getInterfaceData(),
                transactions  : pub.getTransactions()
            });
        }
    };

    pri.create = function () {
        pri.wallet = electrum.WalletFactory.standardWallet();
    };

    pub.seed = function (seed) {
        seed = $.trim(seed);

        pri.wallet.buildFromMnemonic(seed);
        pri.monitor = electrum.NetworkMonitor.start(pri.wallet);

        pri.monitor.addListener(listener);

        return {error : false};
    };

    pub.send = function (amount, toAddress) {
        pri.wallet.send(amount, toAddress, pri.monitor);
    };

    pub.getTransactions = function () {
        return pri.wallet.getTransactions();
    };

    pub.getInterfaceData = function () {
        var format = bitcore.util.formatValue,
            addresses = pri.wallet.getAddresses(),
            confirmed = 0,
            unconfirmed = 0,
            total = 0,
            data = {
                addresses    : addresses
            };

        addresses.forEach(function(address){
            confirmed += address.confirmed;
            unconfirmed += address.unconfirmed;
        });

        total = confirmed + unconfirmed;


        data.totalBalance = format(total);
        data.confirmedBalance = format(confirmed);
        data.unconfirmedBalance = format(unconfirmed);

        return data;
    };

    pri.create();

    return pub;
})();