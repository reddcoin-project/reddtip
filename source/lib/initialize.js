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


RDD =  {};

RDD.vars = {
    tipBotUser : 'reddtipbot',
    modalWidth : 490
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

    'beer',
    'champagne',
    'coffee',
    'all'
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
    'pi',
    'e'
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