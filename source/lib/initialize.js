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


RDD =  {};

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