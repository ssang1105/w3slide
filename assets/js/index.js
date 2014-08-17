$(document).ready(function(){

    var win = $(window),
        btn_signin = $('#signInBtn'),
        logo = $('#logo')
    win.load(function(){
        console.log('win.onload')
        logo.css({
            left:win.innerWidth()/2-logo.width()/2
        })
        btn_signin.css({ left : win.innerWidth()-logo.width()})

    });
});
