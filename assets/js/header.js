var loginLogo;
var loginusername;
var loginuserID;
var loginuserPic;

$(document).ready(function(){

    if(window.location.pathname=='/login_success'){
        var logo = $('#logo a img').attr('src'),
            name = $('#namespace').text(),
            userID = $('.profilePicture').attr('id'),
            userPic = $('.profilePicture').attr('src')

        localStorage.setItem('loginLogo', logo);
        localStorage.setItem('loginusername',name);
        localStorage.setItem('loginuserID',userID);
        localStorage.setItem('loginuserPic', userPic);

//        $('#namespace').text(logo);
//        $('#logo a img').attr('src',name);
//        $('.profilePicture').attr('id',userID);
//        $('.profilePictrue').attr('src',userPic);
        $('#logo a img').css({ left:$(window).innerWidth()/2-$('#logo a img').width()/2 })
    }
    else {
        console.log(localStorage.getItem('loginuserPic'))
        $('#namespace').text(localStorage.getItem('loginusername'));
        $('#logo a img').attr('src',localStorage.getItem('loginLogo'));
        $('.profilePicture').attr('id', localStorage.getItem('loginuserID'));
        $('.profilePicture').attr('src', localStorage.getItem('loginuserPic'));
        $('#logo a img').css({ left:$(window).innerWidth()/2-$('#logo a img').width()/2 })
    }

});