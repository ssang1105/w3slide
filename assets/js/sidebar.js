$(document).ready(function() {
    sidebarStatus = false;
    console.log('q')
    $('.sidebar-toggle').click(function() {
        if (sidebarStatus == false) {
            $('.sidebar').animate({
                marginLeft: "0px",
                opacity: "1"
            }, 500);
            $('.background').animate({
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
            sidebarStatus = false;
        }
    });
});