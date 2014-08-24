$(document).ready(function(){

    var win = $(window),
        xBtn = $('.x'),
        popup = $('.popup'),
        logo = $('#logo'),
        btn_createslide = $('#createSlidesBtn'),
        btn_createPPT = $('#createPPT'),
        btn_uploadPPT = $('#uploadPPT'),
        pptLists = $('#pptLists'),
        userID = $('.profilePicture')[0].id,
        isNewSlide


    win.load(function(){
        socket.emit('getUsersPPT', userID);
        socket.on('userPPT', function(ppt){
            console.log(ppt)
            // 불러올 PPT가 있을 경우에
            if(ppt){
                var existingSlides = '<div class="userSlide" id='+ppt.url+' onclick="location.href=\'' + '/' + ppt.url + '\'" style="float:left;"><a href="#"><img src="'+ ppt.thumbnail+'" style=" margin : 20px 20px 0px 20px; width: 170px; height: 170px;" draggable="false">' +
                    '<div><div style="margin-left:30px;"></div><div style="margin-left: 30px">'+ ppt.fileName+'</div></a>';
                pptLists.append(existingSlides);
                $('#'+ppt.url).click(function(e){
                socket.emit('loadExistSlide',ppt.url, userID);
                // 슬라이드를 클릭하여 slide.ejs로 가면, ppt schema에 저장 되어 있던 PPT 정보, 멤버 띄우기
                        // 새 프로젝트일 때 (일단 파싱 방법이 확정되야됨.)
                        // 기존 프로젝트일 때 (일단 파싱 방법이 확정되야됨)
                })
            }
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
        isNewSlide=false;
        console.log('file upload');
        // 파일 업로드
        // pptx 파일만 선택 가능하도록
        // pptLists.append
        // 서버에 DB 저장 요청
        popup.hide();
        overlay.appendTo(document.body).remove();
    });

    btn_createPPT.click(function(){
        isNewSlide=true
        socket.emit('createSlide', userID, isNewSlide);
        popup.hide();
        overlay.appendTo(document.body).remove();
    });



    socket.on('slideInfo',function(user, isNewSlide){
        // 나중에는 PPT 미리보기가 가능하게 하기위해서 이미지 SRC를 PPT Schema에서 PPT 썸네일 가져와야겠다.
        var pptURL = makeid();
        var newSlide = '<div class="userSlide" id='+pptURL+' onclick="location.href=\'' + '/' + pptURL + '\'"  style="float:left;"><a href="#"><img src="../assets/image/index/samplePPT.png" style=" margin : 20px 20px 0px 20px; width: 170px; height: 170px;" draggable="false"><div>' +
            '<input class="slideName" type="text" value="Enter the name"><div style="margin-left:30px;" id="slideName'+user.projectNum+'"></div></div></a>';

        pptLists.append(newSlide);

        $('.slideName').focus().keypress(function(e) {
            if(e.which === 13) {
                $('#slideName'+user.projectNum).text($(this).val());
                $('.slideName').css({ display : 'none'});
                var pptURL = $(this).parents()[2].id,
                    pptImg = $('.userSlide a img').attr('src'),
                    pptName = $('#slideName'+user.projectNum).text();
                $('#'+pptURL).click(function(e){
                    console.log(pptURL)
                })
                socket.emit('newSlides', pptURL, pptImg, pptName, user, isNewSlide);
                $(this).blur();
            }
        });

    });


});

function makeid()  {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for( var i=0; i < 5; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
}
