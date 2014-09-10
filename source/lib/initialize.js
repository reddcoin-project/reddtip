/************************************************************
 * Initialization
 * Creates the namespace and includes extension-wide settings,
 * as well as any global state we need.
 ************************************************************/


/**
 * Prints parameter to console
 * @param variable
 */
function dbg(variable)
{
    return;
    console.log(variable);
}

function inherit(base, instance){
    return $.extend({}, base, instance);
}

function err(message, type){
    var err = new Error(),
        type = type || 'Standard';
    err.name = 'ReddTip ' + type + ' Error';
    err.message = message;
    throw(err);
}

exports = {};
RDD =  exports;

RDD.vars = {
    tipBotUser : 'reddtipbot',
    addressApi : 'http://noproject.com/reddtip/json.php',
    modalWidth : 490
};

RDD.keys = {
    reddApiGet  : '968NXJ8A3XPmzKZ09v07xGNSp2HgwPFDsg0oW2F0Rou4pkYmV2bdAkK3tQ64A3Np',
    reddApiPost : 'RK3UjjEHqyrKVRaFe6X4lbCH7H3F5l9wcEogqDCjx5vK2AGeoZwfFSEnHuwbo8MF'
};

RDD.tipList = [
    50,
    100,
    200,
    500,

    1000,
    2000,
    5000,
    10000,

    25000,
    50000,
    100000,
    500000,

/*    'beer',
    'champagne',
    'coffee',
    'all'*/

    'upvote',
    'highfive',
    'cookie',
    'pizza',

    'coffee',
    'beer',
    'champagne',
    'wine',

    'gum',
    'burger',
    'donut',
    'sushi',

    'souffle',
    'caviar',
    'nicebeer',
    'coke',

    'hug',
    'kiss',
    'pi',
    'e'
];

RDD.tipKeywords= [
    'all',

    'upvote',
    'highfive',
    'coffee',
    'cookie',
    'gum',
    'burger',
    'donut',
    'sushi',
    'pizza',
    'souffle',
    'caviar',
    'beer',
    'nicebeer',
    'coke',
    'champagne',
    'wine',
    'hug',
    'kiss',
    'pie'
];

RDD.currentTextArea = false;

RDD.settings = {

    minutesToCheckData: 0.5,

    messageType : {
        ACCOUNT_INFO : 1,
        TIP_SENT : 2,
        TIP_RECEIVED : 3,
        TRANSACTION_HISTORY : 4,
        WITHDRAWAL: 5,
        NOT_REGISTERED : 6,
        REGISTERED : 7
    }

};

/**
 * List of all sites
 * @type {{}}
 */
RDD.sites = {};

/**
 * Current Site
 * @type {{}}
 */
RDD.site = {};