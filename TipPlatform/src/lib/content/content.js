
/**
 a chrome plugin by:
 * Andy Groff (andy@groff.co)
 * http://groff.co
 *
 */

$(function(){

    var site = RDD.helpers.getCurrentSite(),
        isIframe = RDD.helpers.isIframe(),
        allowIframes = [
            'apisgoogle',
            'disqus',
            'steamcommunity'
        ],
        iFramesAllowed = $.inArray(site, allowIframes) !== -1;

    //early exit. The site wasn't resolved correctly.
    if(site === false) {
        dbg("site not found Exiting.");
        return;
    }

    dbg("Attempting to load site: " + site);

    if(!iFramesAllowed && isIframe){
        dbg("Stopping iframe loads for this site.");
        return;
    }

    if(RDD.sites[site] === undefined){
        dbg("Site `" + site + "` was not located. Loading Default.");
        site = "default";
    }

    //temporarily overwrite to always be default.
    site = "default"
    dbg("Success");

    //set the current site
    RDD.site = RDD.sites[site];

    //initialize the current site.
    RDD.site.bootstrap();

});
