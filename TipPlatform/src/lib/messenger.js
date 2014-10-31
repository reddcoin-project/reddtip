
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
    pub.newTab = function(tab){
        pri.message("newTab", {uri:tab});
    };

    pub.showTipAction = function(){
        pri.message("showTipAction");
    };

    pub.seedWallet = function(seed, callback){
        pri.message("seedWallet", {seed:seed}, callback);
    };

    pub.getWalletData = function(callback){
        pri.message("getWalletData", callback);
    };

    pub.getWalletTransactions = function(callback){
        pri.message("getWalletTransactions", callback);
    };

    pub.sendTransaction = function(amount, toAddress, callback){
        var data = {
            amount:amount,
            to: toAddress
        };
        pri.message("sendTransaction", data, callback);
    }

    //publish this module.
    exports.messenger = pub;
})(exports);
