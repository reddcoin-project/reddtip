/**
 * RDD.data provides the interface for accessing and persisting extension data.
 */
RDD.data = (function(){
    var pri = {
            mainData : false
        },
        pub = {};

    /**
     * Provides the initial state for plugin data
     * @returns {{currentBalance: boolean, depositAddress: boolean, lastWithdrawalAddress: boolean, lastChecked: number, parsedMessages: Array, operationList: {initialProbe: boolean, needsRegister: boolean, registering: boolean, updateBalance: boolean, updateHistory: boolean}, recordedTransactions: Array}}
     */
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

    /**
     * Loads data if it's not already loaded.
     */
    pri.ensureDataLoaded = function(){
        var userKey = RDD.bg.getUser(),
            data;

        //return early, data is loaded
        if(pri.mainData !== false){
            return;
        }

        dbg("Loading Tip Platform Data");

        //get data
        data = localStorage.getItem(userKey);

        //if null, create new data
        if (data === null) {
            dbg("No data found for `"+userKey+"`. Using default data.");
            dbg("LocalStorage: ");
            dbg(localStorage);
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
        dbg("Current data state saved for `"+userKey+"` ");
        return true;
    };

    /**
     * WARNING: Clears lall data for this user.
     */
    pub.clear = function(){
        var userKey = RDD.bg.getUser();
        dbg("Clearing all data for `userKey` ");
        pri.mainData = pri.getDefaultData();
        localStorage.removeItem(userKey);
    };

    /**
     * Set a data attribute. Currently allows overwriting of any value. We should probably whitelist the attributes
     * that can be set this way.
     * @param attribute String
     * @param value Mixed
     */
    pub.setAttribute = function(attribute, value){
        pri.mainData[attribute] = value;

        dbg("Setting ["+attribute+"] to " + value);
    };

    /**
     * Stores that a message has been parsed so it won't be re-parsed later.
     * @param message
     */
    pub.messageParsed = function(message){
        dbg("Message Parsed: " + message.id);
        pri.mainData.parsedMessages.push(message.id);
    };

    /**
     * Stores a transaction.
     * @param transaction
     */
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

    /**
     * Sets the provided operation to resolved.
     * @param operationName
     */
    pub.resolveOperation = function(operationName){
        dbg("resolving operation: "  + operationName);
        pri.mainData.operationList[operationName] = false;
    };

    /**
     * Unsets the current data. This allows us to ensure that when the user switches, they aren't using the previous
     * user's data.
     */
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