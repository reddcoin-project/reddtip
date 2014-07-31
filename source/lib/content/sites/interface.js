(function(exports){
    var api = {

        buttonHtml : '',

        command    : '',

        tabs       : [
            "tip"
        ],

        tipClicked : function(){  undefinedError("tipClicked"); },

        addButtons : function(){  undefinedError("addButtons"); },

        initialize : function(){  undefinedError("initialize"); },

        /**
         * This gets called when the tip is done to close the modal. Some sites may need to overwrite this default behavior.
         */
        tipDone: function(){
            RDD.modal.close();
        },

        hookTipOpen: function(){  /* nothing to see here... */ }
    };

    //should get hoisted
    function undefinedError(method){
        err("`" + method + "` must be defined.", "Interface");
    }

    //set this as the current site, as well as give it its own spot in sites.interface.
    exports.site = api;
    exports.sites.interface = api;
})(RDD);