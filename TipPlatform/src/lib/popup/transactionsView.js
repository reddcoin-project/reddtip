
/**
 * RDD.transactionsView
 */
(function(exports){
    var pri = {},
        pub = {};

    pri.getTransactionHeader = function(){
        return '' +
            '<tr>' +
            '<th>Info</th>'+
            '<th>User</th>'+
            '<th>Amount</th>'+
            '<th>USD</th>'+
            '<th>Date</th>'+
            '</tr>';
    };

    pri.getAddressLink = function(address, length){
        var length = length || 12,
            shortened = address.substr(0,length) + '[...]',
            link = 'http://bitinfocharts.com/reddcoin/address/'+address;
        return '<a target="_blank" title="RDD Address: '+address+'" href="'+link+'">'+
            shortened
            +'</a>';
    }

    pri.getTransactionRow = function(transaction){
        var info,
            clss = "green",
            user = transaction.from,
            date = RDD.helpers.formatDay(new Date(transaction.time * 1000));

        switch(transaction.type){
            case "sent_tip":
                info = "Tip Sent To: ";
                user = transaction.to;
                break;
            case "received_tip":
                info = "Tip From: ";
                break;
            case "deposit":
                info = "Deposit: ";
                break;
            case "withdrawal":
                info = "Withdrawal to:";
                dbg(transaction);
                user = pri.getAddressLink(transaction.address);
                break;
        }

        if(transaction.amount < 0){
            clss = 'red';
        }

        return '<tr>' +
            '<td>' + info + '</td>'+
            '<td>' + user + '</td>'+
            '<td class="'+clss+'">' + transaction.amount + '</td>'+
            '<td>' + transaction.usd+ '</td>'+
            '<td>' + date + '</th>'+
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
