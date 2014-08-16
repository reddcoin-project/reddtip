/**
 * RDD.ajaxListener
 *
 * The purpose of this module is to enable binding to ever ajax call that takes place. Essentially it's duplicating
 * the default ajax methods, then overwriting them with a new function which includes a call to the old default behavior,
 * but fires an event containing the request data.
 */
(function (exports) {
    var pri = {
            listenerObject : {},
            initialized : false,
            listeners   : []
        },
        pub = {};


    pri.createListenerObject = function(){
        pri.listenerObject = new Object();
        pri.listenerObject.tempOpen = XMLHttpRequest.prototype.open;
        pri.listenerObject.tempSend = XMLHttpRequest.prototype.send;
        pri.listenerObject.callback = function () {
            dbg(this);
            // this.method :the ajax method used
            // this.url    :the url of the requested script (including query string, if any) (urlencoded)
            // this.data   :the data sent, if any ex: foo=bar&a=b (urlencoded)
        }
    };

    pri.sendHttpRequestOveride = function(a,b) {
        if (!a) var a='';
        if (!b) var b='';
        pri.listenerObject.tempSend.apply(this, arguments);
        if(pri.listenerObject.method.toLowerCase() == 'post')s_ajaxListener.data = a;
        pri.listenerObject.callback();
    }

    pri.openHttpRequestOveride = function(a,b) {
        if (!a) var a='';
        if (!b) var b='';
        pri.listenerObject.tempOpen.apply(this, arguments);
        pri.listenerObject.method = a;
        pri.listenerObject.url = b;
        if (a.toLowerCase() == 'get') {
            pri.listenerObject.data = b.split('?');
            pri.listenerObject.data = s_ajaxListener.data[1];
        }
    }


    pri.initialize = function(){

        if(pri.initialized === true){
            return;
        }

        pri.initialized = true;

        pri.createListenerObject();

        XMLHttpRequest.prototype.open = pri.openHttpRequestOveride;

        XMLHttpRequest.prototype.send = pri.sendHttpRequestOveride;
    };


    pub.addListener = function(pattern, callback){
        pri.initialize();
        pri.listeners[pattern] = callback;
    };



    //publish this module.
    exports.ajaxListener = pub;
})(exports);