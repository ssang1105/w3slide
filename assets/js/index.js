$(document).ready(function(){

    var win = $(window),
        btn_signin = $('#signInBtn'),
        logo = $('#logo')
    win.load(function(){
        console.log('win.onload')
        console.log('tset')
<<<<<<< HEAD
        console.log('test333333')
=======
        console.log('test22')
>>>>>>> 0f023e3ba4e7786281c65e450c61d5eb32b73ba3
        logo.css({
            left:win.innerWidth()/2-logo.width()/2
        })
        btn_signin.css({ left : win.innerWidth()-logo.width()})

    });
});
