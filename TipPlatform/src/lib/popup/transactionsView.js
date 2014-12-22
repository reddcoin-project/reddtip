
/**
 * RDD.transactionsView
 */
(function(exports){
    var pri = {},
        pub = {};

    pri.getTransactionHeader = function(){
        return '' +
            '<tr>' +
            '<th>Tx</th>'+
            '<th colspan="2">Details</th>'+
            '<th>Amount</th>'+
            '<th>Date</th>'+
            '</tr>';
    };

    pri.getAddressLink = function(address, length, addressNames){
        var length = length || 15,
            name = addressNames[address] || address,
            shortened = name.substr(0,length),
            link = 'http://live.reddcoin.com/address/'+address;

        if(name.length > shortened.length){
            shortened += '..'
        }

        return '<a target="_blank" title="View Address" href="'+link+'">'+
            shortened
            +'</a>';
    };

    pri.getTransactionRow = function(transaction, addressNames){
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
            user = pri.getAddressLink(transaction.address, 22,  addressNames);
        }
        else {
            user = transaction.address;
        }

        info = transaction.type;
        if(info == 'Received') info += ' with';
        if(info == 'Sent') info += ' To';

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
        var txlink = 'http://live.reddcoin.com/tx/' + transaction.id;
        return '<tr>' +
            '<td><a href="'+txlink+'" target="rddTransaction"><i class="fa fa-link fa-lg" title="View Transaction"></i></a></td>'+
            '<td>' + info + '</td>'+
            '<td>' + user + '</td>'+
            '<td '+amountTitle+' class="'+clss+' align-right">' + amount + '</td>'+
            '<td class="align-right">' + date + '</th>'+
            '</tr>';
    };

    pub.getView = function(transactions, addressNames){
        var html = '<table class="transactionTable">';


        html += pri.getTransactionHeader();


        $.each(transactions, function(i, transaction){
            html += pri.getTransactionRow(transaction, addressNames);
        });


        html += '</table>'

        return html;
    };

    //publish this module.
    exports.transactionsView = pub;
})(exports);
