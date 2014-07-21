
function dbg(variable)
{
    console.log(variable);
}


RDD =  {
    settings : {
        minutesToCheckData: 0.2,
        messageType : {
            ACCOUNT_INFO : 1,
            TIP_SENT : 2,
            TIP_RECEIVED : 3,
            TRANSACTION_HISTORY : 4,
            WITHDRAWAL: 5,
            NOT_REGISTERED : 6,
            REGISTERED : 7
        }
    }
};


RDD.data = (function(){
    var pri = {
            mainData : false
        },
        pub = {};

    pri.getDefaultData = function(){
        return {
            currentBalance : false,
            depositAddress : false,
            lastWithdrawalAddress : false,
            lastChecked : 0,
            parsedMessages : [],
            /**
             * The operation list contains all the operations. Value will be true if they are currently in progress.
             */
            operationList : {
                "initialProbe"  : true,
                "needsRegister" : false,
                registering     : false,
                "updateBalance" : false,
                "updateHistory" : false
            },
            recordedTransactions: []
        }
    };

    pri.ensureDataLoaded = function(){
        var userKey = RDD.bg.getUser(),
            data;
        //return early, data is loaded
        if(pri.mainData !== false){
            return;
        }

        //get data
        data = localStorage.getItem(userKey);

        //if null, create new data
        if (data === null) {
            data = pri.getDefaultData();
        }
        //data is stored as a JSON string. Make it an object
        else {
            data = JSON.parse(data);
        }

        pri.mainData = data;
    };

    /**
     * Saves the current state of the data. Should be called after modifying any data.
     * @returns {boolean}
     */
    pub.save = function(){
        var userKey = RDD.bg.getUser();
        localStorage.setItem(userKey, JSON.stringify(pri.mainData));
        dbg("Current data state saved");
        return true;
    };

    /**
     * WARNING: Clears local storage completely. Only use for testing.
     */
    pub.clear = function(){
        dbg("Clearing all local data");
        pri.mainData = pri.getDefaultData();
        localStorage.clear();
    };

    pub.setAttribute = function(attribute, value){
        pri.mainData[attribute] = value;

        dbg("Setting ["+attribute+"] to " + value);
    };

    pub.messageParsed = function(message){
        dbg("Message Parsed: " + message.id);
        pri.mainData.parsedMessages.push(message.id);
    };

    pub.addTransaction = function(transaction){
        var defaultTransaction = {
                type    : "?",
                from    : "?",
                to      : "?",
                address : "",
                time    : new Date().getTime() / 1000,
                amount  : "?",
                usd     : "?"
            },
            transaction = $.extend(defaultTransaction, transaction);

        pri.mainData.recordedTransactions.unshift(transaction);
    };

    /**
     * Sets the provided operation to in progress and returns the current list.
     * @param operationName
     * @returns {*|RDD.sites.reddit.accountData.operationList|RDD.site.accountData.operationList}
     */
    pub.startOperation = function(operationName){
        dbg("starting operation: "  + operationName);
        pri.mainData.operationList[operationName] = true;
        return pri.mainData.operationList;
    };

    pub.resolveOperation = function(operationName){
        dbg("resolving operation: "  + operationName);
        pri.mainData.operationList[operationName] = false;
    };


    pub.unloadData = function(){
        pri.mainData = false;
    };

    /**
     * Either returns the data attribute requested, or all the data if no attribute is provided.
     *
     * @param attribute - optional - the data attribute you're requesting
     * @returns {*}
     */

    pub.get = function(attribute){
        var attribute = attribute || false;

        pri.ensureDataLoaded();

        if(attribute === false){
            return pri.mainData;
        }

        return pri.mainData[attribute];
    };

    return pub;
})();

RDD.messages = (function(){
    var pub = {},
        pri = {},
        messageType = RDD.settings.messageType;

    pri.parseSentTip= function(message){
        var amountMatch = /\^(\d+(?:\.\d+)?)\s*\^Reddcoins/.exec(message.body)        || ["?", "?"],
            fromMatch   = /\^(\/u\/[^\s]+)/.exec(message.body)                        || ["?", "?"],
            toMatch     = /(?:\^\/u\/[^\s]+).+\^(\/u\/[^\s]+)/.exec(message.body)     || ["?", "?"],
            usdMatch    = /\(\$(\d+(?:\.\d+)?)\)/.exec(message.body)                  || ["?", "?"],
            balance     = RDD.data.get("currentBalance"),
            transaction = {
                type   : "sent_tip",
                from   : fromMatch[1],
                to     : toMatch[1],
                time   : message.created_utc,
                amount : amountMatch[1] * -1,
                usd    : usdMatch[1]
            };

        //if the current balance is unknown (boolean false), then we won't try to adjust it with this transaction
        if(!isNaN(parseFloat(balance))){
            balance =  parseFloat(balance) + transaction.amount;
        }

        RDD.data.addTransaction(transaction);
        RDD.data.setAttribute("currentBalance", balance);
        RDD.data.messageParsed(message);
    };

    pri.fixBotTransaction = function(botTransaction){
        var type    = '?',
            botType = botTransaction.type,
            address = /=(.+)\)$/.exec(botTransaction.to_addr)                       || ["", ""],
            amount  = /(\d+(?:\.\d+)?(?:e\+\d+)?)/.exec(botTransaction.coin_val)    || ["0.0", "0.0"],
            from    = /^(?:\*\*)?([^\*]+)(?:\*\*)?$/.exec(botTransaction.from_user) || ["?", "?"],
            to      = /^(?:\*\*)?([^\*]+)(?:\*\*)?$/.exec(botTransaction.to_user)   || ["?", "?"],
            usd     = /(\d+(?:\.\d+)?)/.exec(botTransaction.fiat_val)               || ["0.0", "0.0"],
            timeAr  = botTransaction.created_utc.split("-"),
            time    = Math.floor((new Date(timeAr[0],timeAr[1] - 1, timeAr[2]).getTime() / 1000));

        address = address[1];
        amount  = parseFloat(amount[1]);
        from    = from[1];
        to      = to[1];
        usd     = parseFloat(usd[1]);

        if(botType === 'w'){
            type = "withdrawal";
        }
        if(botType === 'tip'){
            type = "sent_tip";
            if(botTransaction.to_user.charAt(0) === "*"){
                type = "received_tip";
            }
        }

        if(type === 'sent_tip' || type === "withdrawal"){
            amount = amount * -1;
        }

        return {
            type    : type,
            from    : from,
            to      : to,
            time    : time,
            address : address,
            amount  : amount,
            usd     : usd
        }
    };

    pri.parseTransactionHistory= function(message){
        var tableBody = /(?=type)([\s\S]+)\n\n\*\*\*\*/.exec(message.body)[1] || "?",
            tableLines = tableBody.split("\n"),
            key = tableLines.shift().split("|");


        tableLines.shift();
        tableLines.reverse();

        RDD.data.setAttribute("recordedTransactions", []);

        $.each(tableLines, function(i, line){
            var ar = line.split("|"),
                transaction = {};
            $.each(ar, function(index, column){
                transaction[key[index]] = column;
            });

            if(transaction.state === "✓"){
                transaction = pri.fixBotTransaction(transaction);
                RDD.data.addTransaction(transaction);
            }
        });

        RDD.data.messageParsed(message);
        RDD.data.resolveOperation("updateHistory");
        RDD.data.resolveOperation("initialProbe");
        RDD.data.resolveOperation("needsRegister");
    };

    pri.parseRegistered = function(message){
        RDD.data.messageParsed(message);
        RDD.data.startOperation("initialProbe");
        RDD.data.resolveOperation("needsRegister");
        RDD.data.resolveOperation("updateBalance");
    };

    pri.parseNotRegistered = function(message){
        RDD.data.messageParsed(message);
        RDD.data.startOperation("needsRegister");
        RDD.data.resolveOperation("registering");
        RDD.data.resolveOperation("initialProbe");
    };

    pri.parseWithdrawal = function(message){
        var balance = RDD.data.get("currentBalance"),
            amount  = /\^(\d+(?:\.\d+)?)\s*\^Reddcoins/.exec(message.body)  || ["?", "?"],
            address = /([Rr][a-zA-Z0-9]{26,34})/.exec(message.body)         || ["?", "?"],
            usd     = /\(\$(\d+(?:\.\d+)?)\)/.exec(message.body)            || ["?", "?"],
            transaction = {
                type    : "withdrawal",
                from    : "N/A",
                to      : address[1],
                address : address[1],
                time    : new Date().getTime() / 1000,
                amount  : (amount[1] * -1),
                usd     : usd[1]
            };

        RDD.data.addTransaction(transaction);
        RDD.data.setAttribute("currentBalance", (parseFloat(balance)  + transaction.amount));
        RDD.data.messageParsed(message);
    };

    pri.parseAccountInfo = function(message){
        var body     = message.body.split(':---|:---|---:'),
            lines    = body[1].split("\n"),
            dataLine = lines[1],
            data     = dataLine.split("|"),
            address  =  /([Rr][a-zA-Z0-9]{26,34})/.exec(data[1])     || ["?", "?"],
            balance  =  /(\d+(?:\.\d+)?)/.exec(data[2])              || ["?", "?"],
            oldBalance = RDD.data.get("currentBalance"),
            oldAddress = RDD.data.get("depositAddress");

        address = address[1];
        balance = balance[1];

        RDD.data.messageParsed(message);
        RDD.data.resolveOperation("updateBalance");
        RDD.data.resolveOperation("initialProbe");
        RDD.data.resolveOperation("needsRegister");

        if(oldBalance == balance && oldAddress == address){
            return;
        }

        RDD.data.setAttribute("currentBalance", balance);
        RDD.data.setAttribute("depositAddress", address);

    };

    pri.getMessageType = function(message){
        var body = message.body;

        if(message.was_comment === false && body.indexOf("Verified") > 0){
            return messageType.WITHDRAWAL;
        }

        if(body.indexOf("your account info") > 0){
            return messageType.ACCOUNT_INFO;
        }

        if(body.indexOf("here are your last 75 transactions") > 0){
            return messageType.TRANSACTION_HISTORY;
        }

        if(body.indexOf("we've never met.") > 0){
            return messageType.NOT_REGISTERED;
        }

        if(body.indexOf("Thank you for registering") > 0){
            return messageType.REGISTERED;
        }

        if(message.was_comment === true){
            return messageType.TIP_SENT;
        }

        return "N/A";
    };

    pri.parseTipMessage = function(message){
        var parsedMessages = RDD.data.get("parsedMessages"),
            type;

        //if the message has been parsed, return early
        if($.inArray(message.id, parsedMessages) !== -1){
            return 0;
        }

        type = pri.getMessageType(message);

        switch (type){
            case messageType.ACCOUNT_INFO:
                pri.parseAccountInfo(message);
                return 1;
                break;
            case messageType.TIP_SENT:
                pri.parseSentTip(message);
                return 1;
                break;
            case messageType.TRANSACTION_HISTORY:
                pri.parseTransactionHistory(message);
                return 1;
                break;
            case messageType.WITHDRAWAL:
                pri.parseWithdrawal(message);
                return 1;
                break;
            case messageType.NOT_REGISTERED:
                pri.parseNotRegistered(message);
                return 1;
                break;
            case messageType.REGISTERED:
                pri.parseRegistered(message);
                return 1;
                break;
        }

        return 0;
    };

    pub.parse = function(data){
        var messages = data.data.children.reverse(),
            count = 0;

        $.each(messages, function(index, message){
            if(message.data.author === 'reddtipbot'){
                count += pri.parseTipMessage(message.data);
            }
        });

        RDD.data.setAttribute("lastChecked", new Date().getTime());

        RDD.data.save();

        dbg(RDD.data.get());

        return true;
    };

    return pub;
})();

RDD.bg = (function(){
    var pri = {
            user: false
        },

        pub = {};


    pub.setUser = function(data){
        var newUser = data.site + "_" + data.user;
        if(newUser != pri.user){
            RDD.data.unloadData();
        }
        pri.user = newUser;
    };

    pub.getUser = function(){
        return pri.user;
    };

    pub.messageCheckNeeded = function(){
        //testing with cleared data;
        //RDD.data.clear();

        var lastChecked = RDD.data.get("lastChecked"),
            operations = RDD.data.get("operationList");
            now = new Date().getTime(),
            msDifference = now - lastChecked,
            minutes = (msDifference / 1000) / 60;

        //we'll clear out the data to make sure it doesn't stop early in the intro phases.
        if(operations.needsRegister || operations.registering | operations.initialProbe){
            RDD.data.clear();
        }

        if(minutes > RDD.settings.minutesToCheckData){
            dbg("Message Check Needed");
            return true;
        }

        dbg("NO Message Check");
        return false;
    };

    pub.parseMessages = function(data){
        return RDD.messages.parse(data.response);
    };

    pub.getAccountData = function(){
        return {
            "currentBalance"        : RDD.data.get("currentBalance"),
            "depositAddress"        : RDD.data.get("depositAddress"),
            "operationList"         : RDD.data.get("operationList"),
            "lastWithdrawalAddress" : RDD.data.get("lastWithdrawalAddress")
        }
    };

    pub.getDataAttribute = function(data){
        return RDD.data.get(data.attribute);
    };

    pub.operationStarted = function(data){
        var list = RDD.data.startOperation(data.operation);
        RDD.data.save();
        return list;
    };

    pub.withdrawalSent = function(data){
        RDD.data.setAttribute("lastWithdrawalAddress", data.address);
        return RDD.data.save();;
    };

    return pub;
})();







chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        //console.log(sender.tab ? "from a content script:" + sender.tab.url : "from the extension");
        RDD.bg.setUser(request);

        dbg(request);

        //call RDD.bg.METHOD_NAME if the method exists
        if(RDD.bg[request.method] !== undefined){
            sendResponse(RDD.bg[request.method](request));
        }
    }
);