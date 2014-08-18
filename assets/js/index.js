$(document).ready(function(){

    var win = $(window),
        logo = $('#logo')

    win.load(function(){
        console.log('win.onload')
        logo.css({
            left:win.innerWidth()/2-logo.width()/2
        })
        $('.background').css({
        })
    });

});
