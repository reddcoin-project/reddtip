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
        var newUser = "my_test_user";
        if(newUser != pri.user){
            dbg("User changed from `" + pri.user + "` to `" + newUser + "`");
            RDD.data.unloadData();
        }
        pri.user = newUser;
    };

    pub.getUser = function(){
        return pri.user;
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

    pub.addTransaction = function(data){
        var result = RDD.data.addTransaction(data.transaction);
        RDD.data.save();
        return result;
    };

    pub.clearData = function(){
        RDD.data.clear();
    };

    pub.updateYoutubeComment = function(data){

        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            var request = {
                action : "updateGoogleComment",
                message : data.message
            };
            for (var i=0; i<tabs.length; ++i) {
                dbg(tabs[i]);
                chrome.tabs.sendMessage(tabs[i].id, request);
            }
        });
    };

    pub.withdrawalSent = function(data){
        RDD.data.setAttribute("lastWithdrawalAddress", data.address);
        return RDD.data.save();;
    };

    return pub;
})();