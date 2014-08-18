$(document).ready(function() {
    sidebarStatus = false;
    console.log('q')
    $('.background').click(function() {
        if (sidebarStatus == false) {
            $('.sidebar').animate({
                marginLeft: "0px",
                opacity: "1"
            }, 500);
            $('.background').animate({
                marginLeft: "270px",
                opacity: "1"
            }, 500);
//            $('.canvas').animate({
//                marginLeft: "350px",
//                opacity: "1"
//            }, 500);
            $('.canvas-container').animate({
                marginLeft: "270px",
                opacity: "1"
            }, 500);
            sidebarStatus = true;
        }
        else {
            $('.sidebar').animate({
                marginLeft: "-270px",
                opacity: "1"
            }, 500);
            $('.background').animate({
                marginLeft: "0px",
                opacity: "1"
            }, 500);
//            $('.canvas').animate({
//                marginLeft: "220px",
//                opacity: "1"
//            }, 500);
            $('.canvas-container').animate({
                marginLeft: "0px",
                opacity: "1"
            }, 500);
            sidebarStatus = false;
        }
    });
});