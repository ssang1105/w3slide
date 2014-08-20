$(document).ready(function(){
    var win = $(window),
        logo = $('#logo'),
        pptURL = $('#logo').attr('class'),
        room = io.connect('/'+pptURL),
        userList = $('#userList'),
        svgContainer = d3.select('.canvas').append('svg')
                                            .attr('width',$('.canvas').width())
                                            .attr('height', $('.canvas').height()),
        rectBtn =  $('#rect'),
        circleBtn = $('#circle'),
        slide = $('.canvas')

    var textboxClickStatus, rectClickStatus, circleClickStatus
    var objectNum=0;

    win.load(function(){
        logo.css({
            left:win.innerWidth()/2-logo.width()/2
        })
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



    /*
     *       SVG를 이용한 PowerPoint Editor
     */


    rectBtn.click(function(e){ rectClickStatus=true; slide.css({ cursor:'crosshair'}) })
    circleBtn.click(function(e){ circleClickStatus=true; slide.css({ cursor:'crosshair'}) })


    function drawByClick(e){
        // 마우스포인터를 십자가로 바꾸자

        if(rectClickStatus==true){
            svgContainer.append("rect")
                .attr("x", e.offsetX)
                .attr("y", e.offsetY)
                .attr("width", 100)
                .attr("height", 100)
                .attr("style", "fill:#5B9BD5; stroke-width:1; stroke:rgb(0,0,0)")
                .attr("class", 'drawnRect')
                .attr("id", 'rect'+objectNum);
            rectClickStatus=false
        }
        else if(circleClickStatus==true){
            svgContainer.append("circle")
                .attr("cx", e.offsetX+40)
                .attr("cy", e.offsetY+40)
                .attr("r", 50)
                .attr("style", "fill:#5B9BD5; stroke-width:1; stroke:rgb(0,0,0)")
                .attr("class", 'drawnCircle')
                .attr("id", 'circle'+objectNum);
            circleClickStatus=false;
            // 선택 도구 나오
        }

        var line = d3.svg.line()
                            .x(function(d) { return d.x; })
                            .y(function(d) { return d.y; })
                            .interpolate("basis");
        slide.css({ cursor:'default'})
    };

    slide.mousedown(function(e){

    }).mouseup(function(e){
           drawByClick(e)
        })
});

