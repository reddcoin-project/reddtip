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
    getSeed : function(callback){
        RDD.messenger.getNewSeed(function(seed){
            callback(seed);
        });
    }
}

$(function(){
    $("#createNewWallet").click(function(){
        setup.getSeed(function(seed){
            setup.currentSeed = seed;
            $("#createdWalletSeed").val(seed);
            setup.switchElements("#gettingStarted", "#walletCreated");
        });

    });
    $("#importWallet").click(function(){
        setup.switchElements("#gettingStarted", "#importingWallet");
    });
    $("#seedSaved").click(function(){
        setup.switchElements("#walletCreated", "#confirmSeed");
    });
    $("#seedNotSaved").click(function(){
        setup.switchElements("#walletCreated", "#pleaseSaveSeed");
    });
    $("#backToSeedCreated").click(function(){
        setup.switchElements("#pleaseSaveSeed", "#walletCreated");
    });

    $("#closeTab").click(function(){
        window.close();
    });

    $("#importButton").click(function(){
        setup.loading("#importingWallet");
        exports.messenger.seedWallet($('#walletSeed').val(), "test", function(data){
            if(data.error == true){
                alert("something went wrong.");
                return;
            }
            setTimeout(function(){
                setup.unloading("#finished");
            }, 7 * 1000)

        });
    });
});