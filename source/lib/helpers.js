RDD.helpers = {

    isChrome: function(){
        try {
            if(chrome) {
                return true;
            }
        } catch(e) {}

        return false;
    },

    formatDay: function(d){
        var m_names = new Array("Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oc", "Nov", "Dec");

        var curr_date = d.getDate();
        var curr_month = d.getMonth();
        return m_names[curr_month] + " " + curr_date;
    },

    newUuid : function (){
        var d = Date().now();
        var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = (d + Math.random()*16)%16 | 0;
            d = Math.floor(d/16);
            return (c=='x' ? r : (r&0x7|0x8)).toString(16);
        });
        return uuid;
    },

    message: function(data, callback){
        //ensure every request has the site and user available
        data.user = RDD.site.user;
        data.site = RDD.site.name;

        //if(RDD.helpers.isChrome()){
        chrome.runtime.sendMessage(data, callback);
        //}
    },

    getPopupHtml: function(callback){

        if(RDD.helpers.isChrome()){
            $.get(RDD.helpers.url('popup.html'), function(html){
                callback(html);
            });
            return;
        }

        callback(self.options.popupHtml)
    },

    numberWithCommas: function(x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    },

    formatBalance: function(balance){
        balance = Math.floor(balance);
        balance = this.numberWithCommas(balance);
        return balance;
    },

    setPopupBalance: function(currentBalance){
        var initialBalance = currentBalance;
        if(currentBalance === false){
            currentBalance = "N/A";
            initialBalance = currentBalance;
        }
        else{
            currentBalance = this.formatBalance(currentBalance) + " RDD";
        }

        $("#rddFullBalance").html(initialBalance);
        $("#reddCoinBalanceLink").html(currentBalance);
    },

    url: function(path){

        if(RDD.helpers.isChrome()){
            return chrome.extension.getURL('data/' + path);
        }

        var str = self.options.baseUrl;
        str = str.substring(0, str.length - 1)
        return str + path;

    },

    getCommand: function(command, amount, user){
        command = command.replace('{AMOUNT}', amount);

        if(user !== undefined){
            command = command.replace('{RECIPIENT}', user);
        }

        return command;
    },

    getCurrentSite: function(){
        var domain = document.domain;

        switch (domain){
            case 'www.youtube.com':
            case 'youtube.com':
                return 'youtube';
            case 'www.twitter.com':
            case 'twitter.com':
                return 'twitter';

            case 'www.reddit.com':
            case 'reddit.com':
                return 'reddit';

            case 'www.twitch.tv':
            case 'twitch.tv':
                return 'twitch';
        }

        return false;
    }

}