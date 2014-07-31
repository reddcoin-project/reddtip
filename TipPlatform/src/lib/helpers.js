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

    getLocalHtml: function(name, callback){

        if(RDD.helpers.isChrome()){
            $.get(RDD.helpers.url('html/' + name + '.html'), function(html){
                callback(html);
            });
            return;
        }

        callback(self.options[name + "Html"]);
    },

    loadMultiHtml : function(){
        var args = Array.prototype.slice.call(arguments),
            that = this,
            callback = args.pop(),
            countNeeded = args.length,
            count = 0,
            responses = {},
            received = function(name, html){
                count++;
                responses[name] = html;
                if(count === countNeeded){
                    callback(responses);
                }
            };

        $.each(args, function(i, htmlName){
            that.getLocalHtml(htmlName, function(html){
                received(htmlName, html);
            });
        });
    },

    getPopupHtml: function(callback){
        return RDD.helpers.getLocalHtml('popup', callback);
    },

    numberWithCommas: function(x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    },

    prependArticle : function(word){
        var first = word.charAt(0).toUpperCase(),
            vowels = [
                "A",
                "E",
                "I",
                "O",
                "U"
            ];

        if($.inArray(first, vowels) > -1){
            return "an " + word;
        }

        return "a " + word;
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

    appendStylesheet : function(name){
        var url = exports.helpers.url('css/' + name + ".css"),
            html = '<link rel="stylesheet" type="text/css" href="'+url+'">';

        $('head').append(html);
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
            case 'apis.google.com':
                return 'googleComments';
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