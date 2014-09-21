(function(exports){
    var pri = {
            lastHeight : 0


        },
        api = {

        name : 'generic',

        requiredHtmlSnippets : [],

        requireStylesheet    : true,

        showTipUi         : function(){  undefinedError("showTipUi");          },

        addButtons        : function(){  undefinedError("addButtons");         },

        initialize        : function(snippets){  undefinedError("initialize"); },

        /**
         * @param value The value - either an item or an integer that was tipped.
         * @returns {string} A message that can be used to fill comment sections.
         */
        getMessage : function(value){
            dbg("getting message!");
            var message = "I just tipped you ";

            if(!isNaN(parseFloat(value))){
                return message + value + " Reddcoins!";
            }

            if($.inArray(value, exports.tipList) > -1){
                message = message + exports.helpers.prependArticle(value) + " with Reddcoins!";
                return message
            }
        },

        closeIfExists: function(speed, callback){
            var $existingTipUi = $("#reddTipUi"),
                callback = callback || function(){},
                speed = speed || "slow";

            $existingTipUi.hide(speed, function(){
                $existingTipUi.parent().empty().remove();
                callback();
            });
        },

        externalDoTip:function(e){
            exports.tipInterface.doTip(e)
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
                dbg("setting state");
                exports.tipInterface.setState("alert");
                dbg("hooking");
                dbg(that);
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

        _adjustSnippets : function(snippets, operation){
            var newSnippets = [],
                objectSnipppets = {},
                site = this.name + '/';

            $.each(snippets, function(i, item){
                if(operation === "add") {
                    newSnippets.push(site + item);
                }
                else {
                    newSnippets[ i.replace(site, "") ] = item;
                }

            });

            return newSnippets;
        },

        /**
         * This method is called to kick off everything
         */
        bootstrap : function(){
            //get a local reference to this
            var that = this,
                //the first arguments are the names of the html snippets needed
                arguments = this._adjustSnippets(this.requiredHtmlSnippets, 'add'),
                //the last argument will be the callback after all are loaded succesfully
                callback = function(snippets){
                    dbg("Snippets Ready.");
                    snippets = that._adjustSnippets(snippets, "remove");
                    that.initialize(snippets);
                };

            //add the style sheet if needed (default is true)
            if(this.requireStylesheet){
                exports.helpers.appendStylesheet('standard-tip-ui');
            }

            //if there's no required html snippets, we're done here.
            if(arguments.length === 0){
                dbg("No Snippets Requested.");
                this.initialize({});
                return;
            }

            dbg("Getting Snippets.");

            //we need to add the callback as the last element to the arguments array
            arguments.push(callback);

            //call the function which multi-loads html
            exports.helpers.loadMultiHtml.apply(exports.helpers, arguments)
        },

        /**
         * Repeatedly checks an element's size and calls the callback when it changes. This is useful
         * for augmenting the UI whenever new tipable content is loaded via ajax.
         * @param $element
         * @param callback
         */
        pollElementSize : function($element, callback){
            var that = this,
                height = $element.height();

            if(height != pri.lastHeight){
                callback();
                pri.lastHeight = height;
            }

            setTimeout(function(){
                that.pollElementSize($element, callback);
            }, 2000);
        },

        /**
         * Repeatedly checks an element's children count and calls the callback when it grows. This is useful
         * for augmenting the UI whenever new tipable content is appended to an element.
         * @param $element
         * @param callback
         * @param previousChildrenCount
         */
        pollElementChildren : function($element, callback, previousChildrenCount){
            var that = this,
                currentChildrenCount = $element.children().length;

            if(previousChildrenCount === undefined){
                previousChildrenCount = currentChildrenCount;
            }

            if(currentChildrenCount > previousChildrenCount){
                callback();
            }

            setTimeout(function(){
                that.pollElementChildren($element, callback, currentChildrenCount);
            }, 2000);
        },


        /**
         * The site can hook in here to do stuff after the tip interface is opened.
         */
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