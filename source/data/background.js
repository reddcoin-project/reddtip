/**
 * Hooks chrome's message listener and creates the interface to background scripts.
 */
chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        var params = '';
        //console.log(sender.tab ? "from a content script:" + sender.tab.url : "from the extension");
        RDD.bg.setUser(request);

        delete request.site;
        delete request.user;

        $.each(request, function(key, value){

            if(key !== 'method'){
                params += key + ' = `' + value + '`';
            }

        });

        if(params !== ''){
            params = " | Params: " + params;
        }

        dbg("Calling Method: " + request.method + params);

        //call RDD.bg.METHOD_NAME if the method exists
        if(RDD.bg[request.method] !== undefined){
            sendResponse(RDD.bg[request.method](request));
        }
    }
);