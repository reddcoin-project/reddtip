$.fn.enterKey = function (fnc) {
    return this.each(function () {

        $(this).keypress(function (ev) {
            var keycode = (ev.keyCode ? ev.keyCode : ev.which);

            if (keycode == '13') {
                fnc.call(this, ev);
            }
        })
    })
}


var setup = {
    currentSeed : '',
    switchElements : function(hide, show){

        $(hide).slideUp("fast", function(){
            $(show).slideDown("fast");
        })
    },
    loading : function(toHide){
        $(toHide).hide();
        $("#loading").show();
    },
    unloading : function(toShow){
        this.switchElements("#loading", toShow)
    },
    seedFromElement : function(selector){
        var seed = $(selector).val();
        //replace multiple spaces with one
        seed = seed.replace(/\s{2,}/g, ' ');
        return $.trim(seed);
    },
    seedsMatch : function(){
        var created = this.seedFromElement('#createdWalletSeed'),
            confirm =this.seedFromElement('#seedConfirmation');
        return created === confirm;
    },
    createWallet : function(seed, password, savingsAccountType){
        exports.messenger.seedWallet(seed, password, savingsAccountType, function(data){
            if(data.error == true){
                alert("something went wrong.");
                return;
            }
            setTimeout(function(){
                setup.unloading("#finished");
            }, 7 * 1000)

        });
    },
    getSeed : function(callback){
        RDD.messenger.getNewSeed(function(seed){
            callback(seed);
        });
    }
}

$(function(){

    var operations = {};

    operations.showImport = function(){
        setup.switchElements("#gettingStarted", "#importingWallet");
    };

    operations.importWallet = function(){
        var seed = $("#walletSeed").val(),
            $error = $("#validSeedError");

        $error.hide();

        RDD.messenger.checkSeed(seed, function(isValid){
            if(!isValid){
                $error.show('slow');
            }
            else {
                setup.switchElements("#importingWallet", "#createPassword");
            }
        });
    };

    operations.createPassword = function(){
        var pw = setup.seedFromElement('#password'),
            $error = $("#passwordError");

        $error.hide();
        if(pw.length < 8){
            $error.show('slow');
            return;
        }

        setup.switchElements("#createPassword", "#confirmPassword");
    };

    operations.confirmPassword = function(){
        var pw = setup.seedFromElement('#password'),
            pwConfirm = setup.seedFromElement('#passwordAgain'),
            $error = $("#passwordConfirmError");

        $error.hide();
        if(pw !== pwConfirm){
            $error.show('slow');
            return;
        }

        setup.switchElements("#confirmPassword", "#readyToCreate");
    };


    $(".startOver").click(function(){
        location.reload();
    });

    $("#createNewWallet").click(function(){
        setup.getSeed(function(seed){
            setup.currentSeed = seed;
            $("#createdWalletSeed").val(seed);
            setup.switchElements("#gettingStarted", "#walletCreated");
        });

    });

    $("#importWallet").click(operations.showImport);

    $("#importButton").click(operations.importWallet);
    $("#walletSeed").enterKey(operations.importWallet);

    $("#doCreatePassword").click(operations.createPassword);
    $("#password").enterKey(operations.createPassword);

    $("#doConfirmPassword").click(operations.confirmPassword);
    $("#passwordAgain").enterKey(operations.confirmPassword);

    $("#seedSaved").click(function(){
        setup.switchElements("#walletCreated", "#confirmSeed");
    });
    $("#seedNotSaved").click(function(){
        setup.switchElements("#walletCreated", "#pleaseSaveSeed");
    });
    $("#backToSeedCreated").click(function(){
        setup.switchElements("#pleaseSaveSeed", "#walletCreated");
    });
    $("#doSeedConfirmation").click(function(){
        var $error = $("#confirmError");

        $error.hide();
        if(!setup.seedsMatch()){
            $error.show('slow');
            return;
        }

        setup.switchElements("#confirmSeed", "#createPassword");
    });


    $("#doCreateWallet").click(function(){
        var pw = setup.seedFromElement('#password'),
            seed = setup.seedFromElement('#createdWalletSeed'),
            savingsAccountType = 'watch';

        if($("#spendSavings").is(':checked')){
            savingsAccountType = 'encrypted';
        }

        if(seed === ''){
            seed = setup.seedFromElement('#walletSeed');
        }
        setup.loading("#readyToCreate");
        setup.createWallet(seed, pw, savingsAccountType);
    });

    $("#closeTab").click(function(){
        window.close();
    });

});