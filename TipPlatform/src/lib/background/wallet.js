exports.wallet = (function () {
    var pri = {
            walletStorageKey : 'reddcoinWallet',
            wallet  : false,
            monitor : false
        },
        pub = {},
        listener = {},
        electrum = require('electrum'),
        bitcore = require('bitcore');

    listener.idle = function(data){
        pri.saveWallet();
    };

    listener.dataReceived = function(data){
        if(data.request && data.request.method === 'blockchain.address.subscribe'){
            return;
        }

        pri.updateInterface();
    };

    pri.updateInterface = function(){
        var popupWindow = chrome.extension.getViews({type:'popup'})[0];

        if(popupWindow){
            popupWindow.RDD.popup.updateInterface({
                interfaceData : pub.getInterfaceData(),
                transactions  : pub.getTransactions()
            });
        }
    };

    pri.startWallet = function () {
        pri.monitor = electrum.NetworkMonitor.start(pri.wallet);

        pri.monitor.addListener('idle', listener.idle);
        pri.monitor.addListener('dataReceived', listener.dataReceived);
    };

    pri.saveWallet = function () {
        console.log("Saving Wallet: ");
        console.log(pri.wallet.toObject());
        localStorage.setItem(pri.walletStorageKey, JSON.stringify(pri.wallet.toObject()))
    };

    pri.loadWallet = function (walletObject) {
        console.log("Loading Wallet: ");
        console.log(JSON.parse(walletObject));
        pri.wallet.fromObject(JSON.parse(walletObject));
        pri.startWallet();
    };

    pri.create = function () {
        var walletObject = localStorage.getItem(pri.walletStorageKey);
        pri.wallet = electrum.WalletFactory.standardWallet();

        if(walletObject !== null){
            pri.loadWallet(walletObject);
        }
    };

    pub.updateName = function(address, name){
        var res = pri.wallet.updateName(address, name);
        pri.saveWallet();
        //pri.updateInterface();
        return res;
    };

    pub.updateContact = function(address, name){
        var res = pri.wallet.updateContact(address, name);
        pri.saveWallet();
        //pri.updateInterface();
        return res;
    };

    pub.getNewSeed = function () {
        return pri.wallet.getNewSeed();
    };

    pub.checkSeed= function (seed) {
        return pri.wallet.checkSeed(seed);
    };

    pub.seed = function (seed, password) {
        seed = $.trim(seed);

        pri.wallet.buildFromMnemonic(seed, password);
        pri.wallet.activateAccount(0, 'Social Funds', 'encrypted', password);
        pri.wallet.activateAccount(1, 'Savings', 'watch', password);
        //pri.wallet.activateAccount(2, 'Cash', 'encrypted', password);

        pri.startWallet();

        return {error : false};
    };

    pub.checkPassword = function (password) {
        return pri.wallet.passwordIsCorrect(password);
    };

    pub.send = function (amount, toAddress, password) {
        pri.wallet.send(amount, toAddress, password, pri.monitor);
    };

    pub.getTransactions = function () {
        return pri.wallet.getTransactions();
    };

    pub.getInterfaceData = function () {
        var format = bitcore.util.formatValue,
            addresses = pri.wallet.getAddresses('all'),
            accounts  = pri.wallet.getAccountInfo(),
            contacts = pri.wallet.getContacts(),
            confirmed = 0,
            unconfirmed = 0,
            total = 0,
            data = {
                accounts  : accounts,
                addresses : addresses,
                contacts  : contacts
            };

        accounts.forEach(function(account){
            confirmed += account.confirmed;
            unconfirmed += account.unconfirmed;
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