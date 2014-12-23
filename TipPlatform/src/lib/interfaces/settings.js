var settings = {

    render : function(settings){
        $("select.setting").each(function(){
            var $select = $(this),
                name    = $select.attr("name");

            $select.val(settings[name]);
        });
    },

    fetch : function(callback){
        RDD.messenger.getSettings(function(settings){
            callback(settings);
        });
    },

    save : function(){
        var settings = {};

        $("select.setting").each(function(){
            var $select = $(this),
                value   = $select.val(),
                name    = $select.attr("name");

            settings[name] = value;
        });

        RDD.messenger.setSettings(settings, function(){});
    },

    deleteWallet : function(callback){
        RDD.messenger.deleteWallet(callback);
    }
};


$(function(){

    settings.fetch(function(opts){
        settings.render(opts);
    });


    $("select.setting").change(settings.save);

    $("#deleteForever").click(function(){
        $("#deleteInitial").hide('slow');
        $("#deleteFinal").show('slow');
    });

    $("#dontDelete").click(function(){
        $("#deleteInitial").show('slow');
        $("#deleteFinal").hide('slow');
    });

    $("#finallyDeleteForever").click(function(){
        $("#deleteFinal").hide('slow');
        settings.deleteWallet(function(){
            window.close();
        });
    });
});
