
/**
 * RDD.messenger
 *
 * Allows sending and receiving of messages to the background process.
 */
(function(exports){
    var pri = {},
        pub = {};

    pri.message = function(method, data, callback){
        data = data || {};

        if($.isFunction(data)){
            callback = data;
            data = {};
        }

        data.method = method;

        chrome.runtime.sendMessage(data, callback);
    };

    pri.addTransaction = function(transaction, callback){
        /* Types:
         * withdrawal
         * deposit
         * received_tip
         * sent_tip
         * defaultTransaction = {
         *   type    : "?",
         *   from    : "?",
         *   to      : "?",
         *   address : "",
         *   time    : new Date().getTime() / 1000,
         *   amount  : "?",
         *   usd     : "?"
         * }
         */
        var data = { transaction: transaction };

        pri.message("addTransaction", data, callback);
    };

    pub.getDataAttribute = function(attribute, callback){
        var request = { attribute : attribute };
        dbg("getting attribute: " + attribute);
        pri.message("getDataAttribute", request, callback);
    };

    pub.clearData = function(){
        pri.message("clearData");
    };

    pub.addDeposit = function(amount, callback){
        var transaction = {
            type   : "deposit",
            from   : "-",
            usd    : "0.00",
            amount : amount
        };
        pri.addTransaction(transaction, callback);
    };

    pub.addWithdrawal = function(amount, address, callback){
        var transaction = {
            type   : "withdrawal",
            address: address,
            usd    : "0.00",
            amount : amount
        };

        //ensure negative transaction
        if(transaction.amount > 0){
            transaction.amount = transaction.amount * -1;
        }

        pri.addTransaction(transaction, callback);
    };

    pub.sendTip = function(amount, user, callback){
        dbg("sending!");
        var transaction = {
            type   : "sent_tip",
            to     : user,
            usd    : "0.00",
            label  : '',
            site   : window.location.hostname,
            amount : amount
        };


        if(RDD.tipKeywords[amount] !== undefined){
            transaction.label = amount;
            transaction.amount = RDD.tipKeywords[amount];
        }

        //ensure negative transaction
        if(transaction.amount > 0){
            transaction.amount = transaction.amount * -1;
        }

        pri.addTransaction(transaction, callback);
    };

    pub.setYoutubeComment = function(message){
        pri.message("updateYoutubeComment", {message : message});
    };

    pub.withdrawalSent = function(address){
        pri.message("withdrawalSent", {address:address});
    };


    /*************************************************************
     * NEW WALLET MESSAGES
     *************************************************************/
    pub.closePaymentPopup= function(){
        pri.message("closePaymentPopup");
    };
    pub.newTab = function(tab){
        pri.message("newTab", {uri:tab});
    };

//    pub.showTipAction = function(){
//        pri.message("showTipAction");
//    };

    pub.checkPassword = function(password, callback){
//        callback(false);
        pri.message("checkPassword", {password:password}, callback);
    };

    pub.updateName = function(address, name){
        pri.message("updateName", {address:address, name:name});
    };

    pub.updateContact = function(address, name){
        pri.message("updateContact", {address:address, name:name});
    };

    pub.seedWallet = function(seed, password, savingsAccountType, callback){
        pri.message("seedWallet", {seed:seed, password:password, savingsAccountType: savingsAccountType}, callback);
    };

    pub.deleteWallet = function(callback){
        pri.message("deleteWallet", callback);
    };

    pub.checkSeed = function(seed, callback){
        pri.message("checkSeed", {seed:seed}, callback);
    };

    pub.getNewSeed = function(callback){
        pri.message("getNewSeed", callback);
    };

    pub.getWalletData = function(callback){
        pri.message("getWalletData", callback);
    };

    pub.getSettings = function(callback){
        pri.message("getSettings", callback);
    };

    pub.setSettings = function(settings, callback){
        pri.message("setSettings", {settings:settings}, callback);
    };

    pub.getWalletTransactions = function(callback){
        pri.message("getWalletTransactions", callback);
    };

    pub.checkTransaction = function(amount, tipJarEnabled, callback){
        pri.message("checkTransaction", {
            amount:amount,
            tipJarEnabled : tipJarEnabled
        }, callback);
    };

    pub.unlockTipJar = function(password, callback){
        pri.message("unlockTipJar", {password:password}, callback);
    };

    pub.lockTipJar = function(callback){
        pri.message("lockTipJar", {}, callback);
    };

    //amount, account, requirePw, toAddress, password
    pub.sendTransaction = function(amount, account, requirePw, toAddress, password, callback){
        var data = {
            amount    : amount,
            account   : account,
            requirePw : requirePw,
            password  : password,
            to        : toAddress
        };
        pri.message("sendTransaction", data, callback);
    }

    //publish this module.
    exports.messenger = pub;
})(exports);
