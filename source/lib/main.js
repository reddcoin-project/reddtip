var pageMod = require("sdk/page-mod");
var self    = require("sdk/self");
var Request = require("sdk/request").Request;

var startContentScript = function(popupHtml){

    pageMod.PageMod({
        //for whatever reason, the array of includes didn't seem to be working. Ultra-escaped cryptic regex to the rescue.
        include: /https?:\/\/(?:www\.)?(?:reddit.com\/r\/.*\/comments\/|twitter\.com|twitch\.tv).*/,

        contentScriptFile: [
            self.data.url("jquery.js"),
            self.data.url("content.js")
        ],

        contentStyleFile: self.data.url("styles.css"),

        contentScriptOptions: {
            baseUrl : self.data.url(""),
            popupHtml: popupHtml
        }
    });

}

var popup = Request({
    url: self.data.url("popup.html"),
    onComplete: function(data){

        startContentScript(data.text)
    }
});

popup.get();

