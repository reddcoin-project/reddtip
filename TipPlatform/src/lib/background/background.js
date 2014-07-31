(function($, exports){
    var pri = {
            postKey : false,
            getKey  : false
        },
        pub = {};

    pri.isFunction = function(functionToCheck) {
        var getType = {};
        return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
    };

    pri.apiRequestPost = function(method, data, callback){
        data.APIKey = pri.postKey;

        pri.apiRequest(method, data, callback, 'POST');
    };

    pri.apiRequestGet = function(method, username, callback){
        //for requests where username isn't required, we'll shift the parameters around so that the
        //second argument is the callback, and username is an empty string.
        if(pri.isFunction(username)){
            callback = username;
            username = "";
        }

        if(username !== ''){
            username = '/' + username;
        }

        method = method + '/' + pri.getKey + username;

        pri.apiRequest(method, {}, callback);
    };

    pri.apiRequest = function(method, data, callback, type){
        var type = type || 'GET',
            url = 'https://api.reddapi.com/v1/json/' + method,
            request = {
                type: type,
                url: url,
                headers: {
                    "Content-Type":"application/json"
                }
            };

        if(typeof data.APIKey !== "undefined"){
            request.data = JSON.stringify(data);
        }

        $.ajax(request).done(callback);

    };

    pub.setPostKey = function(postKey){
        pri.postKey = postKey;
    };

    pub.setGetKey = function(getKey){
        pri.getKey = getKey;
    };

    pub.CreateNewUser = function(username, callback){
        var data = { Username: username };
        pri.apiRequestPost('CreateNewUser', data, callback);
    };

    pub.GetUserList = function(callback){
        pri.apiRequestGet('GetUserList', callback);
    };

    pub.GetUserInfo = function(username, callback){
        pri.apiRequestGet('GetUserInfo', username, callback);
    };

    pub.GetUserBalance = function(username, callback){
        pri.apiRequestGet('GetUserBalance', username, callback);
    };

    pub.GetUserBalanceDetail = function(username, callback){
        pri.apiRequestGet('GetUserBalanceDetail', username, callback);
    };

    if ( typeof define === "function" && define.amd) {
        define( "ReddApi", ["jquery"], function () { return pub; } );
    }

    exports.ReddApi = pub;
})($, exports);



/**
 * Provides an interface between the content script and packground processes.
 * Essentially, all the public methods here can be called from the content script.
 */
RDD.bg = (function(){
    var pri = {
            user: false
        },

        pub = {};

    pri.testApi = function(){
        return;
        var username = "TestTralf",
            printResponse = function(response){
                dbg(response);
            },
            timeout = 0,
            timeoutInterval = 3000;

        RDD.ReddApi.setGetKey(RDD.keys.reddApiGet);
        RDD.ReddApi.setPostKey(RDD.keys.reddApiPost);

        //RDD.ReddApi.CreateNewUser(username, printResponse);

        setTimeout(function(){
            RDD.ReddApi.GetUserList(printResponse);
        }, timeout);
        timeout += timeoutInterval;

        setTimeout(function(){
            RDD.ReddApi.GetUserBalance(username, printResponse);
        }, timeout);
        timeout += timeoutInterval;

        setTimeout(function(){
            RDD.ReddApi.GetUserBalanceDetail(username, printResponse);
        }, timeout);
        timeout += timeoutInterval;

        setTimeout(function(){
            RDD.ReddApi.GetUserInfo(username, printResponse);
        }, timeout);
        //timeout += timeoutInterval;

    };

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

        pri.testApi();

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

    pub.initiateApi = function(data){
        var details = {
            interactive : true
        };

        dbg(details);

        var res = chrome.identity.getAuthToken(details, function (response){
            dbg(response);
        });

        dbg(res);
    }

    pub.checkYoutubeUser = function(data){
        var url = 'http://noproject.com/reddtip/json.php',
            request = {
                method    : "getUserAddress",
                channelId : data.id
            };
        return $.getJSON(url, request);
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