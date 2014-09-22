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

    injectFunction : function(theFunction, params){
        var actualCode = '(' + theFunction + ')('+JSON.stringify(params)+');';
        var script = document.createElement('script');
        script.textContent = actualCode;
        (document.head||document.documentElement).appendChild(script);
        script.parentNode.removeChild(script);
    },

    clickElementNatively : function($element){
        var id = "element" + Math.random();

        $element.attr("id", id);

        exports.helpers.injectFunction(function(innerId){
            document.getElementById(innerId).click();
        }, [id]);

        $element.removeAttr("id");

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

    url: function(path){

        if(RDD.helpers.isChrome()){
            return chrome.extension.getURL('data/' + path);
        }

        var str = self.options.baseUrl;
        str = str.substring(0, str.length - 1)
        return str + path;

    },

    typeValue : function($item, message){
        var interval = 60,
            timeout = interval,
            currentValue = "",
            characters = message.split("");

        $.each(characters, function(i, character){
            timeout += interval;
            setTimeout(function(){
                currentValue += character;
                $item.val(currentValue);
            }, timeout);
        });
    },

    appendStylesheet : function(name){
        var url = exports.helpers.url('css/' + name + ".css"),
            html = '<link rel="stylesheet" type="text/css" href="'+url+'">';

        $('head').append(html);
    },

    isIframe : function(){
        return window != window.top;
    },


    getCurrentSite: function(){
        var domain = document.domain;

        //remove www
        domain = domain.replace('www.', '');
        //make array of segments
        domain = domain.split('.');
        //pop off the tld
        domain.pop();
        return domain.join("");

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