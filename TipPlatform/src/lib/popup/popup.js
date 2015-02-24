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
                '    <span>' + format(accountInfo.confirmed + accountInfo.unconfirmed) + '</span> RDD',
                '</small>',
                '</h4>',
                '<p>',
                '    <i class="fa ' + icon + '"></i>&nbsp;&nbsp;',
                accountInfo.typeName,
                //'    <a href="#" class="right light viewHistory">View History</a>',
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
            '    <div class="grid_10">',
            '        <i class="fa fa-files-o fa-lg" title="Copy Address"></i>&nbsp;',
            '    </div>',
            '    <div class="grid_70 nameContainer" data-for="address" title="Click to Rename">',
            address.name,
            '    </div>',
            '    <div class="grid_20 align-right">',
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
            '    <div class="grid_5">',
            '        <i class="fa fa-arrow-circle-left fa-lg" title="Select this Contact"></i>',
            '    </div>',
            '    <div class="grid_35 nameContainer" data-for="contact">',
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

    pri.catchEnter = function(inputSelector, buttonSelector){
        $(inputSelector).keyup(function(e){
            if(e.which === 13){
                $(buttonSelector).trigger('click');
            }
        });
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
    };

    pri.doQuickPay = function (query) {
        $("body").addClass("quickpay");
        $(".reddSettingsTab").hide();
        $("#reddTab_withdrawal").show();

        pri.updateSendForm(query.address, query.label, query.amount);

        pri.isFullPageMode = true;
    };

    pri.withPassword = function(callback, message){
        var checkPassword = function(){
            var val = $('#password').val(),
                requirePw = true;

            if($("#sendAccount option:selected").attr("data-with-pass") !== 'yes'){
                requirePw = false;
            }

            $("#passwordError").hide();
            $("#password").hide();
            $("#pwLoading").show();




            setTimeout(function(){
                //we're doing this with a timeout as the password check does a bunch of hashes which
                //may cause some browser lockup
                exports.messenger.checkPassword(val, function(isValid){
                    var $pw = $("#password");
                    $pw.val("");
                    if(isValid || ! requirePw){
                        setTimeout(function(){
                            callback(val, requirePw);
                            $pw.show();
                            $("#pwLoading").hide();
                        }, 1000);

                        return;
                    }
                    $("#passwordError").slideDown("slow");
                    $("#pwLoading").hide();
                    $pw.show();
                    $pw.focus();
                });
            }, 100);
        };



        if(message){
            $("#passwordMessage").html(message).show();
        }

        var cancel = function(){
            pri.openTab("withdrawal");
        };

        pri.openTab('password');

        $("#passwordCancel").click(cancel);
        $("#passwordOkay").click(checkPassword);

        $("#password").focus();
    };

    pri.sendGui = function (details) {
        var $address = $("#sendAddress"),
            $amount = $("#sendAmount"),
            name =  $("#sendLabel").val(),
            toAddress = $.trim($address.val()),
            amount = $.trim($amount.val()),
            addressIsValid = /^[Rr][a-zA-Z0-9]{26,34}$/.test(toAddress),
            amountIsValid = !isNaN(parseFloat(amount)),
            sendFunction;

        $address.removeClass("error");

        if (!addressIsValid) {
            $address.addClass("error");
        }

        $amount.removeClass("error");

        if (!amountIsValid) {
            $amount.addClass("error");
        }

        exports.messenger.updateContact(toAddress, name);

        if (!amountIsValid || !addressIsValid) {
            return;
        }

        sendFunction = function(password, requirePw){

            var account = $("#sendAccount").val();
            exports.messenger.sendTransaction(amount, account, requirePw, toAddress, password, function () {
                pri.updateSendForm();

                if(account === '-1' && requirePw){
                    exports.messenger.unlockTipJar(password, function(){
                        dbg('Tip Jar Unlocked!');
                    });
                }

                pri.notification("Transaction is being broadcast.");

                pri.openTab("withdrawal");

                var closePopup = function () { pri.closePopup(); };
                if (pri.isFullPageMode) {
                    setTimeout(closePopup, 4000);
                }
            });
        };

        var msg = "You are about to send <strong>"+details.amount+" RDD</strong> to <strong>"+details.to+"</strong>";
        msg += '<br/>';
        msg += '<br/>';
        msg += 'This will debit the following account: ';
        msg += '<select name="sendAccount" id="sendAccount">';
        $.each(details.usableAccounts, function(i, account){
            var requirePw = 'yes';
            if(!account.requiresPassword){
                requirePw = 'no';
            }
            msg += '<option data-with-pass="'+requirePw+'" value="'+account.index+'">'+account.name+'</option>';
        });

        msg +=  '</select>';
        pri.withPassword(sendFunction, msg);

        $("#sendAccount").change(function(){
            var $pwContainer = $('#sendPwContainer'),
                requiresPw = $('option:selected', $(this)).attr('data-with-pass');
            if(requiresPw === 'yes'){
                $pwContainer.show();
            }
            else {
                $pwContainer.hide();
            }

            amount = amount * 1;
            var hideThreshold = pri.settings.hidePromptThreshold * 1;
            dbg(amount, hideThreshold, requiresPw);
            dbg(amount <= hideThreshold , requiresPw !== 'yes');
            if(amount <= hideThreshold && requiresPw !== 'yes'){
                console.log('triggering');
                $("#passwordOkay").trigger('click');
                pri.openTab('autoSent');
                setTimeout(function(){
                    pri.openTab("withdrawal");
                }, 3000);
            }
        });

        $("#sendAccount").trigger('change');


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

    pri.getAddressNames = function(){
        var names = {};
        _.forIn(pri.walletData.contacts, function(name, address){
            names[address] = name;
        });
        _.each(pri.walletData.addresses, function(address){
            names[address.address] = address.name;
        });

        return names;
    };

    pri.renderTransactions = function (transactions) {
        //define the function to do the rendering
        var render = function (transactions) {
            var html = exports.transactionsView.getView(transactions, pri.getAddressNames());
            $("#rddTransactionsTable").html(html);
        };

        // set transactions equal to false if not provided
        transactions = transactions || false;

        // if transactions provided, render them and exit
        if (transactions !== false && transactions !== undefined) {
            render(transactions);
            return;
        }

        //transactions not provided. Fetch then render.
        exports.messenger.getWalletTransactions(function (transactions) {
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

        if(tab !== 'password'){
            localStorage["rddLastTab"] = tab;
        }


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

        //location.reload();
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

        $container.empty();
        _.forIn(contacts, function(address, name){
            $container.append(pri.getContactRow(address, name));
        });

    };

    pri.renderAddresses = function (containerSelector) {
        var account = _.parseInt($('#addressSelect').val()),
            where = {accountIndex : account},
            addresses = _.where(pri.walletData.addresses, where),
            $container = $(containerSelector),
            $change = $("#myChangeList"),
            changeCount = 0,
            view = $('#addressView').val(),
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
        header += '<div class="grid_10">&nbsp;</div>';
        header += '<div class="grid_70">Address</div>';
        header += '<div class="grid_20">RDD</div>';
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
                changeCount++;
                $change.append(html);
            }
            else {
                $container.append(html);
            }

        });

        if(changeCount === 0){
            $("#changeLabel").hide();
        }
        else {
            $("#changeLabel").show();
        }
    };

    pri.checkTipJar = function(totalBalance, tipJarBalance){
        var showError = false,
            num = parseFloat,
            maxBalance = num(pri.settings.maxBalance),
            maxBalancePercent = num(pri.settings.maxBalancePercent),
            percent = (tipJarBalance / totalBalance) * 100,
            maxAllowed = Math.floor(Math.min(maxBalance, (maxBalancePercent / 100) * totalBalance));

        if(pri.settings.tipJarEnabled === 'false'){
            $("#tipJarRow").hide();
            return;
        }
        if(tipJarBalance > maxBalance){
            showError = true;
        }

        if(percent > maxBalancePercent){
            showError = true;
        }

        if(showError){
            $('#tipJarExtraMessage').html('Max Allowed: ' + maxAllowed);
            $('#tipJarError').show('slow');
        }
    };

    pri.renderWalletData = function (data) {
        var format = bitcore.util.formatValue,
            tipJarBalance = format(data.addresses[0].confirmed),
            balance = Math.floor(data.totalBalance);
        balance = exports.helpers.numberWithCommas(balance);

        pri.checkTipJar(data.totalBalance, tipJarBalance);
        pri.renderAccounts(data.accounts, '#accountsContainer');
        pri.renderAddresses('#myAddressList');
        pri.renderContacts('#myContacts');
        $("#reddCoinBalanceLink").html(balance + " RDD");
        $("#rddFullBalance").html(data.totalBalance);
        //$("#rddConfirmedBalance").html(data.confirmedBalance);
        $("#rddTipJarBalance").html(tipJarBalance);
        $("#rddUnconfirmedBalance").html(data.unconfirmedBalance);
    };

    pri.setState = function (current) {
        $(".reddState").hide();
        $(".redd" + current + "State").show();
    };

    pri.walletDataLoaded = function (data) {
        pri.walletData = data;
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

        if (pri.transactionsRendered || true) {
            pri.renderTransactions(data.transactions);
        }
    };

    pub.bind = function () {
        var tabSelector = ".reddSettingsTabLink",
            $addressTab = $("#reddTab_addresses"),
            query = exports.helpers.getQueryVariables();


        exports.messenger.getSettings(function(settings){
            pri.settings = settings;
            exports.messenger.getWalletData(pri.walletDataLoaded);
        });


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

        $("#doSendButton").click(function(){
            var amount = $("#sendAmount").val();
            var to = $("#sendLabel").val() || $("#sendAddress").val();
            var $errorElement = $("#transactionError");

            dbg(pri.settings);

            $errorElement.hide();
            RDD.messenger.checkTransaction(amount, true, function(details){
                dbg(details);
                details.to = to;

                if(details.isPossible){
                    pri.sendGui(details);
                }
                else {
                    $errorElement.show('slow');
                }

            });
        });
        $("#reddTipCancel").click(function () {
            pri.closePopup();
        });

        $addressTab.on("click", '.fa-files-o', function () {
            pri.copyAddress($(this).closest(".row"));
        });

        var editNameFunction = function () {
            pri.editName($(this).closest(".row"));
        };

        $("#reddTab_contacts").on("click", '.nameContainer', editNameFunction);
        $addressTab.on("click", '.nameContainer', editNameFunction);

        $("#reddCoinPopupBody").on("blur", '#changeAddressName', pri.updateName);
        $("#reddCoinPopupBody").on("keydown", '#changeAddressName', function(e){
            if(e.which == 13){
                pri.updateName.apply(this);
            }
        });

        $("#myContacts").on("click", '.fa-arrow-circle-left, .grid_60', function(){
            if($('input', $(this)).length > 0){
                return;
            }
            var $row = $(this).closest('.row');
            pri.updateSendForm($row.data('address'), $row.data('name'));
            pri.openTab('withdrawal');
        });

        pri.catchEnter("#sendAddress", "#doSendButton");
        pri.catchEnter("#sendLabel", "#doSendButton");
        pri.catchEnter("#sendAmount", "#doSendButton");

        pri.catchEnter("#password", "#passwordOkay");

        pri.setState("Setup");

    };

    //publish this module.
    exports.popup = pub;
})(exports);

//Janky. I know...
$(function () {
    RDD.popup.bind();
});