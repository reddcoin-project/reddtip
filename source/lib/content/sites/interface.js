(function(exports){
    var api = {

        buttonHtml : '',

        command    : '',

        tipClicked : function(){  undefinedError("tipClicked"); },

        addButtons : function(){  undefinedError("addButtons"); },

        initialize : function(){  undefinedError("initialize"); }
    };

    //should get hoisted
    function undefinedError(method){
        err("`" + method + "` must be defined.", "Interface");
    }

    //set this as the current site, as well as give it its own spot in sites.interface.
    exports.site = api;
    exports.sites.interface = api;
})(RDD);