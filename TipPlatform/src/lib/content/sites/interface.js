(function(exports){
    var api = {

        name : 'generic',

        showTipUi         : function(){  undefinedError("showTipUi");         },

        addButtons        : function(){  undefinedError("addButtons");        },

        renderInterface   : function(){  undefinedError("renderInterface");   },

        initialize        : function(){  undefinedError("initialize");        },

        getMessage : function(value){
            var message = "I just tipped you ";

            if(!isNaN(parseFloat(value))){
                return message + value + " Reddcoins!";
            }

            if($.inArray(value, exports.tipList) > -1){
                message = message + exports.helpers.prependArticle(value) + " with Reddcoins!";
                return message
            }
        },

        /**
         * Handles the actual tip processing.
         */
        doTip : function(){
            var that = this,
                value = exports.tipInterface.getValue(),
                user = this.getTippedUser();

            exports.tipInterface.setState("working");

            exports.messenger.sendTip(value, user, function(){
                var message = that.getMessage(value);
                exports.tipInterface.setState("alert");
                that.hookTipDone(value, message);
            });

        },

        /**
         * This is a hook to allow site specific augmentations to the tip UI.
         * This is useful for adding classes to the elements to produce a native feel.
         * @param $tipUi
         * @returns jQuery
         */
        adjustTipUi : function($tipUi){
            return $tipUi;
        },

        /**
         * Fetches the tip UI, calls site specific augmentations, then appends it to the provided element.
         * Optionally accepts a callback when finished.
         *
         * @param $container
         * @param [callback]
         */
        addTipUi : function($container, callback){
            var that = this;
            callback = callback || function(){};

            exports.tipInterface.fetch(function($tipUi){
                //add the site name as a class
                $tipUi.addClass(that.name);
                //do any site specific conversions
                $tipUi = that.adjustTipUi($tipUi);
                //append to the provided container.
                $container.empty().append($tipUi);

                callback();
            });
        },

        hookTipOpen: function(){  /* nothing to see here... */ },

        /**
         * The site can hook in here to do stuff after the tip is done.
         */
        hookTipDone: function(value, message){ /* nothing to see here... */ }
    };

    //should get hoisted
    function undefinedError(method){
        return;
        err("`" + method + "` must be defined.", "Interface");
    }

    //set this as the current site, as well as give it its own spot in sites.interface.
    exports.site = api;
    exports.sites.interface = api;
})(RDD);