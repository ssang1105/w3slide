$(document).ready(function(){
    var win = $(window),
        logo = $('#logo')

    win.load(function(){
        console.log('asdf')
        logo.css({
            left:win.innerWidth()/2-logo.width()/2
        })

        // 해당 Schema의 컨텐츠들을 DB에서 불러오기
        // 일단 members를 불러오자
        // 실시간으로 member가 추가, 로그온/오프되려면 이게 하나의 방이어야겠지
    })

});