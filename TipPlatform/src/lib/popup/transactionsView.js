
/**
 * RDD.transactionsView
 */
(function(exports){
    var pri = {},
        pub = {};

    pri.getTransactionHeader = function(){
        return '' +
            '<tr>' +
            '<th colspan="2">Details</th>'+
            '<th>Amount</th>'+
            '<th>Date</th>'+
            '</tr>';
    };

    pri.getAddressLink = function(address, length){
        var length = length || 12,
            shortened = address.substr(0,length) + '[...]',
            link = 'http://live.reddcoin.com/address/'+address;
        return '<a target="_blank" title="RDD Address: '+address+'" href="'+link+'">'+
            shortened
            +'</a>';
    };

    pri.getTransactionRow = function(transaction){
        var info,
            isPositive = transaction.total >= 0,
            amount = exports.helpers.htmlRound(transaction.total / 100000000),
            clss = "green",
            user = transaction.from,
            title = "",
            amountTitle = "",
            dateInstance = new Date(transaction.time * 1000),
            date = RDD.helpers.formatTime(dateInstance);

//        switch(transaction.type){
//            case "sent_tip":
//                info = "Tip Sent To: ";
//                user = transaction.to;
//                break;
//            case "received_tip":
//                info = "Tip From: ";
//                break;
//            case "deposit":
//                info = "Deposit: ";
//                break;
//            case "withdrawal":
//                info = "Withdrawal to:";
//                dbg(transaction);
//                user = pri.getAddressLink(transaction.address);
//                break;
//        }

        if(transaction.address[0] === "R"){
            user = pri.getAddressLink(transaction.address);
        }
        else {
            user = transaction.address;
        }

        info = transaction.type
        dbg(transaction);

        if(transaction.site != "?"){
            title = ' title="' + transaction.site + '" ';
        }
        if(transaction.label != ""){
            amountTitle = ' title="' + transaction.label + '" ';
        }
        if(!isPositive){
            clss = 'red';
        }

        amountTitle = '';
        return '<tr>' +
            '<td>' + info + '</td>'+
            '<td '+title+'>' + user + '</td>'+
            '<td '+amountTitle+' class="'+clss+' align-right">' + amount + '</td>'+
            '<td class="align-right">' + date + '</th>'+
            '</tr>';
    };

    pub.getView = function(transactions){
        var html = '<table class="transactionTable">';


        html += pri.getTransactionHeader();


        $.each(transactions, function(i, transaction){
            html += pri.getTransactionRow(transaction);
        });


        html += '</table>'

        return html;
    };

    //publish this module.
    exports.transactionsView = pub;
})(exports);
