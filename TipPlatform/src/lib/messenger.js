
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

    pub.getAccountData = function(callback){
        pri.message("getAccountData", callback);
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
            amount : amount
        };
        pri.addTransaction(transaction, callback);
    };

    pub.withdrawalSent = function(address){
        pri.message("withdrawalSent", {address:address});
    };


    //publish this module.
    exports.messenger = pub;
})(exports);
