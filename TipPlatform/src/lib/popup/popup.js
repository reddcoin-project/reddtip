/**
 * RDD.popup
 */
(function (exports) {
    var pri = {
            walletData           : false,
            isFullPageMode       : false,
            isIframe             : false,
            transactionsRendered : false
        },
        bitcore = require('bitcore'),
        _ = require('electrum')._,
        pub = {};

    pri.getAccountHtml = function (accountInfo) {
        var format = bitcore.util.formatValue,
            icon = accountInfo.type === 'watch' ? 'fa-lock' : 'fa-unlock-alt',
            html = [
                '<h4>',
                accountInfo.name,
                '<small>',
                '    <span>' + format(accountInfo.confirmed) + '</span> RDD',
                '</small>',
                '</h4>',
                '<p>',
                '    <i class="fa ' + icon + '"></i>',
                accountInfo.typeName,
                '    <a href="#" class="right light viewHistory">View History</a>',
                '    <a href="#" class="right light transfer">Transfer</a>',
                '</p>',
                '<hr>'
            ];

        return html.join("");
    };

    pri.getAddressRow = function (address, val) {
        var html;
        val = exports.helpers.htmlRound(val);

        html = [
            '<div class="row" data-name="' + address.name + '" data-address="' + address.address + '">',
            '    <div class="grid_15">',
            '        <i class="fa fa-files-o fa-lg" title="Copy Address"></i>&nbsp;',
            '        <i class="fa fa-edit fa-lg" title="Rename"></i>',
            '    </div>',
            '    <div class="grid_60 nameContainer" data-for="address">',
            address.name,
            '    </div>',
            '    <div class="grid_25 align-right">',
            val,
            '    </div>',
            '</div>'
        ];

        return html.join("\n");
    };

    pri.getContactRow = function (name, address) {
        var html;

        html = [
            '<div class="row" data-name="' + name + '" data-address="' + address + '">',
            '    <div class="grid_10">',
            '        <i class="fa fa-edit fa-lg" title="Rename"></i>',
            '    </div>',
            '    <div class="grid_30 nameContainer" data-for="contact">',
            name,
            '    </div>',
            '    <div class="grid_60">',
            address,
            '    </div>',
            '</div>'
        ];

        return html.join("\n");
    };

    pri.closePopup = function () {
        if (pri.isIframe) {
            exports.messenger.closePaymentPopup();
        }

        window.close();
    };

    pri.notification = function (message, seconds, speed) {
        var $div = $("#popupNotificationDiv"),
            s = speed || 'slow',
            waitTime = seconds || 1;

        $div.text(message);

        $div.fadeIn(s, function () {
            setTimeout(function () {
                $div.fadeOut(s);
            }, waitTime * 1000);

        })
    };

    pri.updateSendForm = function(address, label, amount){
        $("#sendAddress").val(address || '');
        $("#sendAmount").val(amount || '');
        $("#sendLabel").val(label || '');
    }

    pri.doQuickPay = function (query) {
        $("body").addClass("quickpay");
        $(".reddSettingsTab").hide();
        $("#reddTab_withdrawal").show();

        pri.updateSendForm(query.address, query.label, query.amount);

        pri.isFullPageMode = true;
    };

    pri.sendGui = function () {
        var $address = $("#sendAddress"),
            $amount = $("#sendAmount"),
            toAddress = $.trim($address.val()),
            amount = $.trim($amount.val()),
            addressIsValid = /^[Rr][a-zA-Z0-9]{26,34}$/.test(toAddress),
            amountIsValid = !isNaN(parseFloat(amount));

        $address.removeClass("error");

        if (!addressIsValid) {
            $address.addClass("error");
        }

        $amount.removeClass("error");

        if (!amountIsValid) {
            $amount.addClass("error");
        }

        if (!amountIsValid || !addressIsValid) {
            return;
        }

        exports.messenger.sendTransaction(amount, toAddress, function () {
//            $("#sendAmount").val("");
//            $("#sendLabel").val("");
//            $("#sendAddress").val("");
            pri.updateSendForm();

            pri.notification("Transaction is being broadcast.");

            if (pri.isFullPageMode) {
                setTimeout(function () {
                    pri.closePopup();
                }, 4000);
            }
        });
    };

    pri.checkTipableSite = function () {
        var tabQuery = {currentWindow : true, active : true},
            method = {method : "hasTip"},
            setTip = function (data) {
                pri.openTab('withdrawal');
                pri.updateSendForm(data.address, data.domain);

                pri.notification("`" + data.domain + "` Accepts Reddcoin Donations.", 3);
            };

        chrome.tabs.query(tabQuery, function (tabs) {
            var tabId = tabs[0].id;

            chrome.tabs.sendMessage(tabId, method, function (response) {
                if (response && response.hasTip) {
                    setTip(response);
                }
            });
        });
    };

    pri.renderTransactions = function (transactions) {
        //define the function to do the rendering
        var render = function (transactions) {
            var html = exports.transactionsView.getView(transactions);
            console.log(transactions);
            $("#rddTransactionsTable").html(html);
        };

        console.log(transactions);

        // set transactions equal to false if not provided
        transactions = transactions || false;

        // if transactions provided, render them and exit
        if (transactions !== false && transactions !== undefined) {
            render(transactions);
            return;
        }

        //transactions not provided. Fetch then render.
        exports.messenger.getWalletTransactions(function (transactions) {
            console.log(transactions);
            render(transactions);
        });
    };

    pri.openTab = function ($tabLink) {
        var tab, $tab;

        if(_.isString($tabLink)){
            tab = $tabLink;
            $tabLink = $('.reddSettingsTabLink[data-tab="'+tab+'"]')
        }
        else {
            tab = $tabLink.attr("data-tab");
        }

        localStorage["rddLastTab"] = tab;

        $tab = $("#reddTab_" + tab);

        if (tab === 'transactions' && !pri.transactionsRendered) {
            pri.renderTransactions();
            pri.transactionsRendered = true;
        }

        //hide others
        $(".reddSettingsTab").hide();
        $(".reddSettingsTabLink").removeClass("selected");

        $tab.show();
        $tabLink.addClass("selected")
    };

    pri.updateName = function(){
        var $input = $(this),
            nameType = $input.parent().attr('data-for'),
            newName = _.escape($input.val()),
            address = $input.closest('.row').attr('data-address');

        $input.closest('.row').attr('data-name', newName);
        $input.parent().empty().html(newName);
        if(nameType === 'contact'){
            exports.messenger.updateContact(address, newName);
        }
        else {
            exports.messenger.updateName(address, newName);
        }

    };

    pri.editName = function ($row) {
        var $container = $(".nameContainer", $row),
            $oldinput = $("#changeAddressName"),
            name = _.unescape($row.attr("data-name"));

        if($oldinput.length > 0){
            var oldName = $oldinput.closest('.row').attr('data-name');
            var oldParent = $oldinput.parent();
            oldParent.empty();
            oldParent.html(oldName);
        }

        $container.html('<input type="text" id="changeAddressName" maxlength="36" value="">');

        $("#changeAddressName").val(name).focus();
    };

    pri.copyAddress = function ($row) {
        var addr = $row.attr("data-address"),
            oldOncopy = document.oncopy;
        document.oncopy = function (event) {
            event.clipboardData.setData('text/plain', addr);
            event.preventDefault();
        };
        document.execCommand("Copy", false, null);

        document.oncopy = oldOncopy;
        pri.notification("Address Copied to Clipboard.");
    };

    pri.renderAccounts = function (accounts, containerSelector) {
        var $container = $(containerSelector),
            $dropdown = $('#addressSelect');

        $container.empty();
        $dropdown.empty();
        accounts.forEach(function (account) {
            $dropdown.append('<option value="' + account.index + '">' + account.name + '</option>');
            $container.append(pri.getAccountHtml(account));
        });
    };

    pri.renderContacts = function (containerSelector) {
        var contacts = pri.walletData.contacts,
            $container = $(containerSelector);

        dbg(pri.walletData);
        _.forIn(contacts, function(address, name){
            $container.append(pri.getContactRow(address, name));
        });

    };

    pri.renderAddresses = function (containerSelector) {
        var addresses = pri.walletData.addresses,
            $container = $(containerSelector),
            $change = $("#myChangeList"),
            view = $('#addressView').val(),
            account = $('#addressSelect').val(),
            lastIndex = _.findLastIndex(addresses, function (addr) {
                return addr.confirmed > 0 && !addr.isChange;
            }),
            header = '';

        lastIndex++;

        if (pri.walletData === false) {
            dbg("wallet data not loaded.");
            return;
        }

        header += '<div class="row header">';
        header += '<div class="grid_15">---</div>';
        header += '<div class="grid_60">Address</div>';
        header += '<div class="grid_25">RDD</div>';
        header += '</div>';

        $container.empty();
        $change.empty();
        $container.append(header);
        addresses.forEach(function (address, i) {
            var html = '',
                val = bitcore.util.formatValue(address.confirmed);

            if (address.accountIndex != account) {
                return;
            }

            if (view === 'nonEmpty' && address.confirmed == '0') {
                return;
            }

            if (view === 'default' && address.isChange && address.confirmed == '0') {
                return;
            }
            if (view === 'default' && !address.isChange && i > lastIndex) {
                return;
            }

            html += pri.getAddressRow(address, val);

            if (address.isChange) {
                $change.append(html);
            }
            else {
                $container.append(html);
            }

        });
    };

    pri.renderWalletData = function (data) {
        var balance = Math.floor(data.totalBalance);
        balance = exports.helpers.numberWithCommas(balance);

        pri.walletData = data;
        pri.renderAccounts(data.accounts, '#accountsContainer');
        pri.renderAddresses('#myAddressList');
        pri.renderContacts('#myContacts');
        $("#reddCoinBalanceLink").html(balance + " RDD");
        $("#rddFullBalance").html(data.totalBalance);
        //$("#rddConfirmedBalance").html(data.confirmedBalance);
        $("#rddUnconfirmedBalance").html(data.unconfirmedBalance);
    };

    pri.setState = function (current) {
        $(".reddState").hide();
        $(".redd" + current + "State").show();
    };

    pri.walletDataLoaded = function (data) {
        if (data.addresses.length > 0) {
            pri.setState("Settings");
            pri.renderWalletData(data);
            pri.checkTipableSite();
        }
    };

    pri.bindDev = function () {

        $("#devDeposit").click(function () {
            exports.messenger.addDeposit(5000);
        });

        $("#clearData").click(function () {
            exports.messenger.clearData();
        });
    };

    pub.updateInterface = function (data) {
        pri.renderWalletData(data.interfaceData);

        if (pri.transactionsRendered) {
            pri.renderTransactions(data.transactions);
        }
    };

    pub.bind = function () {
        var tabSelector = ".reddSettingsTabLink",
            $addressTab = $("#reddTab_addresses"),
            query = exports.helpers.getQueryVariables();

        pri.isIframe = exports.helpers.isIframe();

        if (query.hasOwnProperty("address")) {
            pri.doQuickPay(query);
        }

        $("#reddCoinPopupImage").attr("src", exports.helpers.url('img/reddcoin_header_logo.png'));

        if (!pri.isFullPageMode) {

            $(tabSelector).click(function () {
                pri.openTab($(this).attr("data-tab"));
            });

            if(localStorage["rddLastTab"]){
                pri.openTab(localStorage["rddLastTab"]);
            }
            else {
                pri.openTab('balance');
            }
        }

        pri.bindDev();

        $("#addressSelect").change(function () {
            pri.renderAddresses('#myAddressList');
        });
        $("#addressView").change(function () {
            pri.renderAddresses('#myAddressList');
        });

        $("#doSendButton").click(pri.sendGui);
        $("#reddTipCancel").click(function () {
            pri.closePopup();
        });

        $addressTab.on("click", '.fa-files-o', function () {
            pri.copyAddress($(this).closest(".row"));
        });

        var editNameFunction = function () {
            pri.editName($(this).closest(".row"));
        };

        $("#reddTab_contacts").on("click", '.fa-edit', editNameFunction);
        $addressTab.on("click", '.fa-edit', editNameFunction);

        $("#reddCoinPopupBody").on("blur", '#changeAddressName', pri.updateName);
        $("#reddCoinPopupBody").on("keydown", '#changeAddressName', function(e){
            if(e.which == 13){
                pri.updateName.apply(this);
            }
        });

        $("#myContacts").on("click", '.grid_60, .nameContainer', function(){
            if($('input', $(this)).length > 0){
                return;
            }
            var $row = $(this).closest('.row');
            pri.updateSendForm($row.data('address'), $row.data('name'));
            pri.openTab('withdrawal');
        });

        pri.setState("Setup");

        exports.messenger.getWalletData(pri.walletDataLoaded);
    };

    //publish this module.
    exports.popup = pub;
})(exports);

//Janky. I know...
$(function () {
    RDD.popup.bind();
});