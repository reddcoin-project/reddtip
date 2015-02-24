/**
 * Provides an interface between the content script and background processes.
 * Essentially, all the public methods here can be called from the content script.
 */
RDD.bg = (function () {
    var pri = {
            user : false
        },

        pub = {};

    pri.tabsChanged = function (data) {

        dbg(data);

        chrome.tabs.sendMessage(data.tabId, {method : "hasTip"}, function (response) {

            if (response && response.hasTip) {
                chrome.browserAction.setBadgeText({ text  : 'Tip'});
            }
            else {
                chrome.browserAction.setBadgeText({ text  : ''});
            }
        });

        //        chrome.tabs.query({currentWindow : true, active : true}, function (tabs) {
        //            var tabId = tabs[0].id,
        //                info = {
        //                    text : 'Tip',
        //                    tabId : tabId
        //                };
        //            console.log(tabs);
        //            chrome.browserAction.setBadgeText(info);
        //        });
    };

    pub.setUser = function (data) {
        var newUser = "my_test_user";
        if (newUser != pri.user) {
            dbg("User changed from `" + pri.user + "` to `" + newUser + "`");
            RDD.data.unloadData();
        }
        pri.user = newUser;
    };

    pub.getUser = function () {
        return pri.user;
    };

    //    pub.getWalletData = function(){
    //        return {
    //            "currentBalance"        : RDD.data.get("currentBalance"),
    //            "depositAddress"        : RDD.data.get("depositAddress"),
    //            "operationList"         : RDD.data.get("operationList"),
    //            "lastWithdrawalAddress" : RDD.data.get("lastWithdrawalAddress")
    //        }
    //    };

    pub.getDataAttribute = function (data) {
        return RDD.data.get(data.attribute);
    };

    pub.addTransaction = function (data) {
        var result = RDD.data.addTransaction(data.transaction);
        RDD.data.save();
        return result;
    };

    pub.clearData = function () {
        RDD.data.clear();
    };

    pub.updateYoutubeComment = function (data) {

        chrome.tabs.query({active : true, currentWindow : true}, function (tabs) {
            var request = {
                action  : "updateGoogleComment",
                message : data.message
            };
            for (var i = 0; i < tabs.length; ++i) {
                dbg(tabs[i]);
                chrome.tabs.sendMessage(tabs[i].id, request);
            }
        });
    };

    pub.withdrawalSent = function (data) {
        RDD.data.setAttribute("lastWithdrawalAddress", data.address);
        return RDD.data.save();
    };

    /*************************************************************
     * NEW WALLET MESSAGES
     *************************************************************/
    pub.closePaymentPopup = function(){
        chrome.tabs.query({active : true, currentWindow : true}, function (tabs) {
            var request = {
                method : "closePaymentPopup"
            };
            for (var i = 0; i < tabs.length; ++i) {
                chrome.tabs.sendMessage(tabs[i].id, request);
            }
        });
    };

    pub.newTab = function (data) {

        chrome.tabs.query({currentWindow : true, active : true}, function (tabs) {
            var newIndex = tabs[0].index,
                url = {
                    index : newIndex,
                    'url' : chrome.extension.getURL(data.uri)
                };
            chrome.tabs.create(url);
        });

    };

    pub.checkPassword = function (data) {
        return RDD.wallet.checkPassword(data.password);
    };

    pub.getWalletData = function () {
        return RDD.wallet.getInterfaceData();
    };

    pub.getWalletTransactions = function () {
        return RDD.wallet.getTransactions();
    };

    pub.updateName = function(data){
        return RDD.wallet.updateName(data.address, data.name);
    };

    pub.updateContact = function(data){
        return RDD.wallet.updateContact(data.address, data.name);
    };

    pub.seedWallet = function (data) {
        return RDD.wallet.seed(data.seed, data.password, data.savingsAccountType);
    };

    pub.deleteWallet = function(){
        localStorage.clear();
        RDD.wallet.deleteWallet();
        return true;
    };

    pub.getNewSeed = function () {
        return RDD.wallet.getNewSeed()
    };

    pub.checkSeed = function (data) {
        return RDD.wallet.checkSeed(data.seed);
    };

    pri.getDefaultData = function(){
        return {
            tipJarEnabled: "true",
            maxBalancePercent: "10",
            maxBalance: "5000",
            hidePromptThreshold: "500"
        };
    };

    pub.getSettings = function () {
        //get data
        var settingsKey = 'rdd_settings',
            data = localStorage.getItem(settingsKey);

        //if null, create new data
        if (data === null) {
            data = pri.getDefaultData();
        }
        //data is stored as a JSON string. Make it an object
        else {
            data = JSON.parse(data);
        }

        dbg("Settings: ");
        dbg(data);

        return data;
    };

    pub.setSettings = function (data) {

        localStorage.setItem('rdd_settings', JSON.stringify(data.settings));
    };

    pub.checkTransaction = function (data) {
        return RDD.wallet.checkTransaction(data.amount, data.tipJarEnabled);
    };

    pub.unlockTipJar = function (data) {
        return RDD.wallet.unlockTipJar(data.password);
    };

    pub.lockTipJar = function () {
        return RDD.wallet.lockTipJar();
    };

    pub.sendTransaction = function (data) {
        return RDD.wallet.send(data.amount, data.account, data.requirePw, data.to, data.password);
    };

    chrome.tabs.onActivated.addListener(pri.tabsChanged)
    chrome.tabs.onUpdated.addListener(function (tabId) {
        pri.tabsChanged({
            tabId    : tabId,
            windowId : -1
        });
    });

    return pub;
})();