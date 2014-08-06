(function(exports){
    var pri = {},
        pub = {};


    pub.buttonHtml = '<button class="button primary tip" style="margin-right: 10px;width: 22%;">Tip</button>';
    pub.command    = '@tipreddcoin +tip {RECIPIENT} {AMOUNT} RDD';

    pub.tipClicked = function(){
        var textArea = $(this).closest('.chat-interface').find('textarea');

        RDD.modal.open(function(tipAmount, tipUser){
            var text = textArea.val()

            text += RDD.helpers.getCommand(RDD.site.command, tipAmount, tipUser);

            textArea.val( text );
        }, true, false);
    };

    pub.addButtons = function(){
        // Add a button to the Twitch chat
        $('.send-chat-button').append(RDD.site.buttonHtml);
        //$('.send-chat-button button:first').css("width", "75%");

        $("body").on("click", ".tip", RDD.site.tipClicked);
    };

    pub.checkWidth = function (waitTime){
        var $button = $('.send-chat-button button:first'),
            width = $button.width();

        // Don't start the script until the page has been loaded correctly
        if (width > 20)
        {
            dbg("Adding buttons.");
            RDD.site.addButtons();
        }
        else if (waitTime <= 44096)
        {
            dbg("twitch waiting...");
            setTimeout(function(){
                RDD.site.checkWidth(waitTime * 2);
            }, waitTime);
        }
    };

    pub.initialize = function(){
        if ($('.chat-option-buttons').length != 0)
        {
            RDD.site.checkWidth(16);
        }
    };

    exports.sites.twitch = inherit(exports.sites.interface, pub);
})(RDD);



var exports = {};
var RDD = exports;

(function (exports) {
    var pri = {
        $results: false,
        $calculateButton: false,
        $initialRdd: false,
        $errorMessage: false,
        resultRowTemplate: '',
        validNumberCallback: function () {}
},
    pub = {};

pri.loadDomObjects = function () {
    pri.$results = $("#results");
    pri.$calculateButton = $("#calculateButton");
    pri.$initialRdd = $("#initialRdd");
    pri.$errorMessage = $("#errorMessage");
    pri.resultRowTemplate = $("#resultRowTemplate").html();
};

pri.calculateClicked = function () {
    var initialRedd = parseFloat(pri.$initialRdd.val());

    pri.$errorMessage.hide();

    if (isNaN(initialRedd)) {
        pri.$errorMessage.show("slow");
        return;
    }
    pri.validNumberCallback(initialRedd);
};

pub.setValidNumberCallback = function (callback) {
    pri.validNumberCallback = callback;
};

pub.clear = function () {
    pri.$results.empty();
};

pub.renderResultRow = function (label, amount) {
    var template = pri.resultRowTemplate,
        html = template.replace('${label}', label).replace('${amount}', amount);
    pri.$results.append(html);
};

pub.bind = function () {
    pri.loadDomObjects();
    pri.$calculateButton.click(pri.calculateClicked);
};

exports.View = pub;
}(exports));


(function (exports) {
    var pri = {
            initialRedd: 0,
            annualGain: 0
        },
        pub = {};

    pub.calculate = function (initialRedd) {
        //according to hoppi
        //total = currentRDD * (1+(0.06/1095)) ** 1095
        var totalMints = 365 * 3,
            total = initialRedd * Math.pow((1 + (0.06 / totalMints)), totalMints);

        pri.initialRedd = initialRedd;
        pri.annualGain = total - initialRedd;
    };

    pub.getAnnual = function () {
        return pri.annualGain.toLocaleString();
    };

    pub.getWeekly = function () {
        return (pri.annualGain / 52).toLocaleString();
    };

    pub.getDaily = function () {
        return (pri.annualGain / 365).toLocaleString();
    };

    exports.Calculator = pub;
}(exports));

$(function () {

    RDD.View.bind();
    RDD.View.setValidNumberCallback(function (initialRedd) {
        var annual, weekly, daily;

        RDD.Calculator.calculate(initialRedd);

        annual = RDD.Calculator.getAnnual();
        weekly = RDD.Calculator.getWeekly();
        daily = RDD.Calculator.getDaily();

        RDD.View.clear();

        RDD.View.renderResultRow("Annual", annual);
        RDD.View.renderResultRow("Weekly", weekly);
        RDD.View.renderResultRow("Daily", daily);
    });
});









//testing