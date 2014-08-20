$(document).ready(function(){
    var win = $(window),
        logo = $('#logo'),
        pptURL = $('#logo').attr('class'),
        room = io.connect('/'+pptURL),
        userList = $('#userList')

    win.load(function(){
        logo.css({
            left:win.innerWidth()/2-logo.width()/2
        })


        /*
         *   pptURL에 해당하는 ppt Schema의 member들이 누구있나 서버에 요청하기.
         *   ('slideMembers'로 받음.)
         */

    })

    room.emit('getSlideMembers',pptURL)

    /*
     *  슬라이드의 멤버 불러오기
     */
    room.on('SlideMembers', function(members){
        // 멤버의 수만큼 동적으로 뿌려주기
        console.log(members)
        for(var i=0; i<members.length; i++){
            userList.append('<div><img src="'+ members[i].profilePicture+'" class = "users" id="'+members[i].id+'"></div>')
        }
    })


    // 낯선 사용자가 페이지에 접속하면, URL추가  중복검사
    // 실시간으로 member가 추가, 로그온/오프되려면 이게 하나의 방이어야겠지

});

