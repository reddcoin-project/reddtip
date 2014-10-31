var setup = {
    switchElements : function(hide, show){

        $(hide).slideUp("fast", function(){
            $(show).slideDown("fast");
        })
    }
}

$(function(){
    $("#createNewWallet").click(function(){
        alert('Sorry, not implemented yet.');
    });
    $("#importWallet").click(function(){
        setup.switchElements("#gettingStarted", "#importingWallet");
    });

    $("#closeTab").click(function(){
        window.close();
    });

    $("#importButton").click(function(){
        exports.messenger.seedWallet($('#walletSeed').val(), function(data){
            if(data.error == true){
                alert("something went wrong.");
                return;
            }
            setup.switchElements("#importingWallet", "#finished");
        });
    });
});