/**
 * Provides an interface between the content script and packground processes.
 * Essentially, all the public methods here can be called from the content script.
 */
RDD.bg = (function(){
    var pri = {
            user: false
        },

        pub = {};


    pub.setUser = function(data){
        var newUser = data.site + "_" + data.user;
        if(newUser != pri.user){
            dbg("User changed from `" + pri.user + "` to `" + newUser + "`");
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
            operations = RDD.data.get("operationList"),
            now = new Date().getTime(),
            msDifference = now - lastChecked,
            minutes = (msDifference / 1000) / 60;

        //we'll clear out the data to make sure it doesn't stop early in the intro phases.
        if(operations.needsRegister || operations.registering || operations.initialProbe){
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