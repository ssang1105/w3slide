$(document).ready(function(){

    var win = $(window),
        xBtn = $('.x'),
        popup = $('.popup'),
        logo = $('#logo'),
        btn_createslide = $('#createSlidesBtn'),
        btn_createPPT = $('#createPPT'),
        btn_uploadPPT = $('#uploadPPT'),
        pptLists = $('#pptLists'),
        socket = io.connect('http://localhost:3000/'),
        userID = $('.profilePicture')[0].id,
        userSlide = $('.userSlide')

    win.load(function(){
        console.log('win.onload')

        // userID를 보내서 사용자의 PPT 아이디 갯수만큼 리스트들의 정보를 가져와. 이를 Append

        socket.emit('getUsersPPT', userID);
        socket.on('userPPT', function(ppt){
            var existingSlides = '<div class="userSlide" style="float:left;"><a href="#"><img src="'+ ppt.thumbnail+'" style=" margin : 20px 20px 0px 20px; width: 170px; height: 170px;" draggable="false">' +
                '<div><div style="margin-left:30px;"></div><div style="margin-left: 30px">'+ ppt.fileName+'</div></a>';
            pptLists.append(existingSlides)
        });
    });

    var overlay = $('<div id="overlay"></div>');
    xBtn.click(function(){
        popup.hide();
        overlay.appendTo(document.body).remove();
        return false;
    });

    btn_createslide.click(function(){
        overlay.show();
        overlay.appendTo(document.body);
        popup.show();
        return false;
    });

    btn_uploadPPT.click(function(){
        console.log('asdfa');
        // 파일 업로드
        // pptx 파일만 선택 가능하도록
        // pptLists.append
        // 서버에 DB 저장 요
        popup.hide();
        overlay.appendTo(document.body).remove();
    });

    btn_createPPT.click(function(){
        socket.emit('createSlide', userID);
        popup.hide();
        overlay.appendTo(document.body).remove();
    });

    userSlide.click(function(){
        console.log('asd');
    })

    socket.on('slideInfo',function(user){
        // 나중에는 PPT 미리보기가 가능하게 하기위해서 이미지 SRC를 PPT Schema에서 PPT 썸네일 가져와야겠다.
        var newSlide = '<div class="userSlide" id="slide'+user.projectNum+'" style="float:left;"><a href="#"><img src="../assets/image/index/samplePPT.png" style=" margin : 20px 20px 0px 20px; width: 170px; height: 170px;" draggable="false">' +
            '<div><input class="slideName" type="text" value="Enter the name"><div style="margin-left:30px;" id="slideSub'+user.projectNum+'"></div></div></a>';
        pptLists.append(newSlide);
        $('.slideName').focus().keypress(function(e) {
            if(e.which === 13) $(this).blur();
        }).blur(function(e) {
                $('#slideSub'+user.projectNum).text($('.slideName').val());
                $('.slideName').css({ display : 'none'});
                socket.emit('newSlides', $('.userSlide a img').attr('src'), $('#slideSub'+user.projectNum).text(), user);
        });

    });
});
