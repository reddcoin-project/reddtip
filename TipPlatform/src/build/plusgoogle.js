/*! reddcoin-tip-platform 2014-09-23 */
!function(a){var b={tippedUser:"",lastHeight:0,lastTipLink:!1,contentArea:!1},c={};b.buttonHtml="",c.name="plusgoogle",c.requiredHtmlSnippets=["button"],c.hookTipDone=function(a,c){var d,e=b.lastTipLink.parent().parent();$(".Dt.wu",e).click(),setTimeout(function(){d=$(".editable",e),d.html(c);var a=$(".d-k-l.b-c.b-c-Ba.b-c-da-ja",e);a.attr("aria-disabled",!1),a.attr("tab-index","0"),a.removeClass("b-c-I")},600)},c.showTipUi=function(a){var c=a.parent(),d=$('<div class="Cx fr"></div>'),e=c.parent(),f=$("header h3 a",e),g=$("#reddTipUi").parent();b.lastTipLink=a,b.tippedUser=f.html(),g.hide("fast",function(){g.empty().remove()}),c.after(d),d.hide(),this.addTipUi(d,function(){d.prepend('<div class="Ar vt"></div>'),$("#reddTipUi").addClass("uiUfi UFIContainer _5pc9 _5vsj _5v9k"),d.show("fast")})},c.adjustTipUi=function(a){var b="d-k-l b-c b-c-R b-c-da-ja",c="d-k-l b-c b-c-Ba b-c-da-ja",d="wu";return $("#reddTipAmount",a).addClass(d),$("#reddTipButton",a).addClass(c),$(".toggleQuickTipsButton",a).addClass("d-s vy"),$(".rddQuickTip",a).addClass(b),a},c.addButtons=function(){$("div.Dg.Ut").each(function(){var a=$(this);a.siblings(".tip").length>0||a.after(b.buttonHtml)})},c.getTippedUser=function(){return b.tippedUser},c.pollHeightChanges=function(){var a=this,c=b.contentArea.height();c>b.lastHeight&&(this.addButtons(),b.lastHeight=c),setTimeout(function(){a.pollHeightChanges()},2e3)},c.initialize=function(d){var e=this,f=a.helpers.url("img/bw_icon16.png");b.buttonHtml=d.button.replace("{bgimg}",f),b.contentArea=$("#contentPane"),b.contentArea.on("click",".tip",function(){e.showTipUi($(this))}),c.pollHeightChanges()},a.sites.plusgoogle=inherit(a.sites.interface,c)}(exports);