$(document).ready(function() {
    sidebarStatus = false;
    $('#sidebarBtn').click(function() {
        if (sidebarStatus == false) {
            $('.sidebar').animate({
                marginLeft: "0px",
                opacity: "1"
            }, 500);
            $('.background').animate({
                marginLeft: "270px",
                opacity: "1"
            }, 500);
            $('.canvas-container').animate({
                marginLeft: "270px",
                opacity: "1"
            }, 500);
            sidebarStatus = true;
            $('#sidebarBtn').attr("src","assets/image/slide/sidebar/toggleBtn_2.png")
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
            $('.canvas-container').animate({
                marginLeft: "0px",
                opacity: "1"
            }, 500);
            $('#sidebarBtn').attr("src","assets/image/slide/sidebar/toggleBtn_1.png");
            sidebarStatus = false;
        }
    });
});