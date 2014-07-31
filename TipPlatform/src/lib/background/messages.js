
RDD.messages = (function(){
    var pub = {},
        pri = {},
        messageType = RDD.settings.messageType;

    pri.parseReceivedTip = function(message){
        var amountMatch = /(\d+(?:\.\d+)?)\s*Reddcoin/.exec(message.body)        || ["?", "?"],
            fromMatch   = /(\/u\/[^\s]+)./.exec(message.body)                        || ["?", "?"],
            toMatch     = /Hey\s*([^\s]+),/.exec(message.body)     || ["?", "?"],
            usdMatch    = /\(\$(\d+(?:\.\d+)?)\)/.exec(message.body)                  || ["?", "?"],
            balance     = RDD.data.get("currentBalance"),
            transaction = {
                type   : "received_tip",
                from   : fromMatch[1],
                to     : toMatch[1],
                time   : message.created_utc,
                amount : amountMatch[1] * 1,
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

        if(body.indexOf("you have received a") > 0){
            return messageType.TIP_RECEIVED;
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
            case messageType.TIP_RECEIVED:
                pri.parseReceivedTip(message);
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
            total = data.data.children.length,
            count = 0;

        $.each(messages, function(index, message){
            if(message.data.author === 'reddtipbot'){
                count += pri.parseTipMessage(message.data);
            }
        });

        RDD.data.setAttribute("lastChecked", new Date().getTime());

        RDD.data.save();

        dbg("Parsed " + count + " Messages. (" + total + ") Total");
        //dbg(RDD.data.get());

        return true;
    };

    return pub;
})();