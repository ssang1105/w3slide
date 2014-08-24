/*
 * **********************************************************************************
 *
 * .canvas를 동적으로 생성하고 그 canvas마다 id 값을 주자.
 *          canvas-container.Append
 * 'canvas' + pptContents[i]
 *  newSlide 인 경우 'canvas0'
 *  oldSlide 인 경우 pptContents의 갯수만큼 canvas-container.Append canvas + pptContents[i]
 *
 * **********************************************************************************
 *
 *  svgContainer는?
 *  svgContainer도 canvas의 갯수(pptContents의 갯수) 만큼 있어야겠지?
 *  (슬라이드 리스트에서 슬라이드 클릭 시 해당 div(canvas)를 불러 와야 하고, 해당 div에는 svgContainer가 하나 씩 딸려있을테니깐)
 *
 * **********************************************************************************
 *
 *
 *  슬라이드 리스트에 슬라이드를 클릭시
 *  해당 div의 display를 none, block 하면서 보여줄까?
 *
 *  슬라이드의 캔버스 : canvas
 *  슬라이드의 미니맵 : cloneSlide
 *  canvas의 SVG : slideSVG
 *
 *  newSlide인 경우에는 'slideSVG0', 'cloneSlide0'
 *  oldSlide인 경우에는 pptContents의 갯수만큼 clone slideSVG + pptContents[i]
 *
 * **********************************************************************************
 *
 *  슬라이드 추가버튼 누를 시 canvas, clone canvas를 하나 씩 추가
 *  슬라이드 삭제버튼 누를 시 현재 선택되 어있는 canvas, clone canvas를 하나 삭제
 *
 * **********************************************************************************
 *
 *  추가 되는 각 Object의 선택기능 추가할 시에 잘 생각해야 해.
 *  단순히 class에 이벤트를 주면 안돼 (export된 Object는 안잡히니깐)
 *  export된 Object의 특징을 찾아야 해.
 *  정 안되면.... 선택박스만드는걸 포기하는게 나을듯.
 *
 */

var svgContainer;
var slideNum=0;

$(document).ready(function(){
    var win = $(window),
        logo = $('#logo'),
        userList = $('#userList'),
        slide = $('.canvas'),
        textboxBtn = $('#textbox'), rectBtn =  $('#rect'),  circleBtn = $('#circle'),   triangleBtn = $('#triangle'), simpleArrowBtn_1 =$('#simple_arrow1'), uploadImageBtn = $('#uploadImage'),
        simpleArrowBtn_2=$('#simple_arrow2'), interArrowBtn_1 =$('#inter_arrow1'), interArrowBtn_2 = $('#inter_arrow2'), lineBtn = $('#line'), lineArrowBtn = $('#line_arrow'),

        userID = $('.profilePicture').attr('id'),
        pptURL = $('#logo').attr('class')

    var textboxClickStatus, rectClickStatus, circleClickStatus, triangleClickStatus, simpleArrowClickStatus_1,
        simpleArrowClickStatus_2, interArrowClickStatus_1, interArrowClickStatus_2, lineClickStatus, lineArrowStatus;

    // 나중에는 objectNum을 DB에서 관리하거나 아예 빼거나 하자
    var objectNum=0;

    //----------------------------chattting-------------------------------
    win.load(function(){
        logo.css({
            left:win.innerWidth()/2-logo.width()/2
        })
        socket.emit('joinroom',{room : pptURL, userID : userID, isSucess : false});
    })




    socket.on('updatechat', function(username, data) {
        if(username === ''){
            $("#chatRoom").append(data+'<br>');

        }
        else{
            if(data !== ''){
                $("#chatRoom").append('<b>'+username+':</b> '+data+'<br>');
            }
        }
    });
    socket.on('userlist',function(data){


        $('#userList').empty();
        if(data.isSucess){
            for(var i=0;i<data.users.length;i++){
                userList.append('<div><img src="'+data.users[i].profilePicture+'" class = "users" id="'+data.users[i].id+'"></div>')
            }
        }
        else{
            $('#+data.users[i].id+').hover();

            console.log('WuRIWURIHAN')
        }

    });
    $(function() {
        $("#send").click( function() {
            var message = $("#data").val();
            $("#data").val('');
            socket.emit('send_msg', message);
        });

        $("#data").keypress(function(e) {
            if (e.which == 13){
                $(this).blur();
                $("#send").click();
                $("#data").focus();
            }
        });
    });
    // 나갈때..
    win.on('beforeunload',function(){


        socket.emit('disconnect',{pptURL:pptURL, userID:userID, isSucess:false});

    })
//----------------------------chattting-------------------------------

    /*
     *  슬라이드의 멤버 불러오기
     */
    socket.emit('getSlideMembers',pptURL)
    socket.on('slideMembers', function(members, isNewSlide){
        //  *************** 새로운 슬라이드일 경우 ***************    //
        if(isNewSlide){
            $('.canvas-container').append('<div class="canvas" id="canvas0"></div>')
            svgContainer = d3.select('#canvas'+slideNum+'').append('svg')
                .attr('viewBox','0 0 ' + $('.canvas').width() +' '+$('.canvas').height())
                .attr('id', 'slideSVG'+slideNum+'')
            $('#slideTable').append('<div><svg id="cloneSlide'+slideNum+'" viewbox="0 0 80 45"><use xlink:href="#slideSVG'+slideNum+'"></use></div>')
            var jsonSlide = JSON.stringify({  data:$('.canvas-container').html() })
            socket.emit('saveSlide',pptURL, jsonSlide, slideNum);
        }
        //  *************** 기존에 불러온 슬라이드일 경우 ***************    //
        else{
            console.log('load Exist Slide')
            socket.emit('getExistSlideSVG', pptURL)
            socket.on('slideSVG', function(pptContents){
                console.log(jQuery.parseJSON(pptContents).data)
//                $('#canvas0').remove()
                $('.canvas-container').append(jQuery.parseJSON(pptContents).data);
                svgContainer = d3.select('#slideSVG'+slideNum+'')
                    .attr('id', 'slideSVG'+slideNum+'')
                console.log(svgContainer)
//                $(''+$('#cloneSlide0')+'').remove()
                $('#slideTable').append('<div><svg id="cloneSlide'+slideNum+'" viewbox="0 0 80 45"><use xlink:href="#slideSVG'+slideNum+'"></use></div>')
                slideSe3tting();
            })
            // ppt contents의 length만큼 뿌리자. ppt contents의 length만큼 id값을 ++
            // oldSlide 인 경우 pptContents의 갯수만큼 canvas-container.Append canvas + pptContents[i]


        }
        slideSetting()
    })

    /*
     *       SVG를 이용한 PowerPoint Editor
     */


    var lineFunction = d3.svg.line()
                              .x(function(d) { return d.x; })
                              .y(function(d) { return d.y; })
                              .interpolate("linear");


    textboxBtn.click(function(e){ textboxClickStatus=true; $('.canvas').css({ cursor:'crosshair'}) })
    rectBtn.click(function(e){ rectClickStatus=true; $('.canvas').css({ cursor:'crosshair'}) })
    circleBtn.click(function(e){ circleClickStatus=true; $('.canvas').css({ cursor:'crosshair'}) })
    triangleBtn.click(function(e){ triangleClickStatus=true; $('.canvas').css({ cursor:'crosshair'}) })
    simpleArrowBtn_1.click(function(e){ simpleArrowClickStatus_1=true; $('.canvas').css({ cursor:'crosshair'}) })
    simpleArrowBtn_2.click(function(e){ simpleArrowClickStatus_2=true; $('.canvas').css({ cursor:'crosshair'}) })
    interArrowBtn_1.click(function(e){ interArrowClickStatus_1=true; $('.canvas').css({ cursor:'crosshair'}) })
    interArrowBtn_2.click(function(e){ interArrowClickStatus_2=true; $('.canvas').css({ cursor:'crosshair'}) })
    lineBtn.click(function(e){ lineClickStatus=true; $('.canvas').css({ cursor:'crosshair'}) })
    lineArrowBtn.click(function(e){ lineArrowStatus=true; slide.css({ cursor:'crosshair'}) })



    function slideSetting(){


        function drawByClick(e, callback){

            var drawnObject;

            uploadImageBtn.click(function(e){
                document.getElementById('file-input').onchange = function handleImage(e){
                    var reader = new FileReader();
                    reader.onload = function (event) {
                        var imgObj = new Image();
                        imgObj.src = event.target.result;
                        imgObj.onload = function () {
                            console.log(svgContainer)
                            var drawnObject = svgContainer.append("image")
                                .attr("xlink:href", event.target.result)
                                .attr("x", $('.canvas').width()/2-150)
                                .attr("y", $('.canvas').height()/2-150)
                                .attr("width", 200)
                                .attr("height", 200)
                                .attr("class", 'drawnObject')
                                .attr("id", 'object'+objectNum)
                                .on("mouseover", function(){d3.select(this).style("cursor", "move");})
                                .on("mouseout", function(){d3.select(this).style("cursor", "default");});
8
                            if(drawnObject){
                                drawnObject_class = drawnObject.attr('class');
                                drawnObject_id = drawnObject.attr('id');
                                callback(drawnObject_class, drawnObject_id);
                            }
                        }


                    }
                    reader.readAsDataURL(e.target.files[0]);
                }
            })

            if(textboxClickStatus==true){

                drawnObject = svgContainer.append("text")
                    .attr("x", e.offsetX)
                    .attr("y", e.offsetY)
                    .text('Enter the text')
                    .attr("font-family", "sans-serif")
                    .attr("font-size", "20px")
                    .attr("fill","black")
                    .attr("class", 'drawnObject')
                    .attr("id", 'object'+objectNum)
                    .on("mouseover", function(){d3.select(this).style("cursor", "move");})
                    .on("mouseout", function(){d3.select(this).style("cursor", "default");})
            }

            else if(rectClickStatus==true){
                drawnObject = svgContainer.append("rect")
                    .attr("x", e.offsetX)
                    .attr("y", e.offsetY)
                    .attr("width", 100)
                    .attr("height", 100)
                    .attr("style", "fill:#5B9BD5; stroke-width:1; stroke:rgb(0,0,0)")
                    .attr("class", 'drawnObject')
                    .attr("id", 'object'+objectNum)
                    .on("mouseover", function(){d3.select(this).style("cursor", "move");})
                    .on("mouseout", function(){d3.select(this).style("cursor", "default");});
            }
            else if(circleClickStatus==true){
                drawnObject = svgContainer.append("circle")
                    .attr("cx", e.offsetX+40)
                    .attr("cy", e.offsetY+40)
                    .attr("r", 50)
                    .attr("style", "fill:#5B9BD5; stroke-width:1; stroke:rgb(0,0,0)")
                    .attr("class", 'drawnObject')
                    .attr("id", 'object'+objectNum)
                    .on("mouseover", function(){d3.select(this).style("cursor", "move");})
                    .on("mouseout", function(){d3.select(this).style("cursor", "default");});
            }
            else if(triangleClickStatus==true){
                // 삼각형 그리기
                var triangleData = [ { "x": e.offsetX,   "y": e.offsetY},  { "x": e.offsetX+50,  "y": e.offsetY-100}, { "x": e.offsetX+100,  "y": e.offsetY}, {"x": e.offsetX,   "y": e.offsetY}]

                drawnObject = svgContainer.append("path")
                    .attr("d", lineFunction(triangleData))
                    .attr("stroke", "black")
                    .attr("stroke-width", 1)
                    .attr("fill", "#5B9BD5")
                    .attr("class", 'drawnObject')
                    .attr("id", 'object'+objectNum)
                    .on("mouseover", function(){d3.select(this).style("cursor", "move");})
                    .on("mouseout", function(){d3.select(this).style("cursor", "default");});
            }
            else if(simpleArrowClickStatus_1==true){
                var arrowData = [ { "x": e.offsetX,   "y": e.offsetY},  { "x": e.offsetX+75,  "y": e.offsetY}, { "x": e.offsetX+75,  "y": e.offsetY+15},
                                 { "x": e.offsetX+100,  "y": e.offsetY-15}, { "x": e.offsetX+75,  "y": e.offsetY-45}, { "x": e.offsetX+75, "y": e.offsetY-30},
                                 {"x": e.offsetX, "y": e.offsetY-30}, { "x": e.offsetX,   "y": e.offsetY}];
                drawnObject = svgContainer.append("path")
                    .attr("d", lineFunction(arrowData))
                    .attr("stroke", "black")
                    .attr("stroke-width", 1)
                    .attr("fill", "#5B9BD5")
                    .attr("class", 'drawnObject')
                    .attr("id", 'object'+objectNum)
                    .on("mouseover", function(){d3.select(this).style("cursor", "move");})
                    .on("mouseout", function(){d3.select(this).style("cursor", "default");});
            }
            else if(simpleArrowClickStatus_2==true){
                var arrowData = [ { "x": e.offsetX,   "y": e.offsetY},  { "x": e.offsetX+75,  "y": e.offsetY}, { "x": e.offsetX+75,  "y": e.offsetY+15},
                                 { "x": e.offsetX+100,  "y": e.offsetY-15}, { "x": e.offsetX+75,  "y": e.offsetY-45}, { "x": e.offsetX+75, "y": e.offsetY-30},
                                {"x": e.offsetX, "y": e.offsetY-30}, { "x": e.offsetX,   "y": e.offsetY}];
                drawnObject = svgContainer.append("path")
                    .attr("d", lineFunction(arrowData))
                    .attr("stroke", "black")
                    .attr("stroke-width", 1)
                    .attr("transform", "rotate(90 "+ e.offsetX+" "+ e.offsetY+")")
                    .attr("fill", "#5B9BD5")
                    .attr("class", 'drawnObject')
                    .attr("id", 'object'+objectNum)
                    .on("mouseover", function(){d3.select(this).style("cursor", "move");})
                    .on("mouseout", function(){d3.select(this).style("cursor", "default");});
            }
            else if(interArrowClickStatus_1==true){
                var arrowData = [ { "x": e.offsetX,   "y": e.offsetY},  { "x": e.offsetX+50,  "y": e.offsetY}, { "x": e.offsetX+50,  "y": e.offsetY+15},
                                    { "x": e.offsetX+80,  "y": e.offsetY-15}, { "x": e.offsetX+50,  "y": e.offsetY-45}, { "x": e.offsetX+50, "y": e.offsetY-30},
                                    {"x": e.offsetX, "y": e.offsetY-30}, {"x": e.offsetX, "y": e.offsetY-45}, {"x": e.offsetX-30, "y": e.offsetY-15}, {"x" : e.offsetX, "y" : e.offsetY+15}, {"x": e.offsetX, "y": e.offsetY}];

                drawnObject = svgContainer.append("path")
                    .attr("d", lineFunction(arrowData))
                    .attr("stroke", "black")
                    .attr("stroke-width", 1)
                    .attr("fill", "#5B9BD5")
                    .attr("class", 'drawnObject')
                    .attr("id", 'object'+objectNum)
                    .on("mouseover", function(){d3.select(this).style("cursor", "move");})
                    .on("mouseout", function(){d3.select(this).style("cursor", "default");});
            }
            else if(interArrowClickStatus_2==true){
                var arrowData = [ { "x": e.offsetX,   "y": e.offsetY},  { "x": e.offsetX+50,  "y": e.offsetY}, { "x": e.offsetX+50,  "y": e.offsetY+15},
                    { "x": e.offsetX+80,  "y": e.offsetY-15}, { "x": e.offsetX+50,  "y": e.offsetY-45}, { "x": e.offsetX+50, "y": e.offsetY-30},
                    {"x": e.offsetX, "y": e.offsetY-30}, {"x": e.offsetX, "y": e.offsetY-45}, {"x": e.offsetX-30, "y": e.offsetY-15}, {"x" : e.offsetX, "y" : e.offsetY+15}, {"x": e.offsetX, "y": e.offsetY}];
                drawnObject = svgContainer.append("path")
                    .attr("d", lineFunction(arrowData))
                    .attr("stroke", "black")
                    .attr("stroke-width", 1)
                    .attr("transform", "rotate(90 "+ e.offsetX+" "+ e.offsetY+")")
                    .attr("fill", "#5B9BD5")
                    .attr("class", 'drawnObject')
                    .attr("id", 'object'+objectNum)
                    .on("mouseover", function(){d3.select(this).style("cursor", "move");})
                    .on("mouseout", function(){d3.select(this).style("cursor", "default");});
            }
            else if(lineClickStatus==true){
                var lineData = [{"x": e.offsetX, "y": e.offsetY}, {"x": e.offsetX+100, "y": e.offsetY}]
                drawnObject = svgContainer.append("path")
                    .attr("d", lineFunction(lineData))
                    .attr("stroke", "#5B9BD5")
                    .attr("stroke-width", 1)
                    .attr("transform", "rotate(45 "+ e.offsetX+" "+ e.offsetY+")")
                    .attr("fill", "#5B9BD5")
                    .attr("class", 'drawnObject')
                    .attr("id", 'object'+objectNum)
                    .on("mouseover", function(){d3.select(this).style("cursor", "move");})
                    .on("mouseout", function(){d3.select(this).style("cursor", "default");});
            }
            else if(lineArrowStatus==true){
                var lineData = [{"x": e.offsetX, "y": e.offsetY}, {"x": e.offsetX+80, "y": e.offsetY}, {"x": e.offsetX+80, "y": e.offsetY+4},
                                {"x": e.offsetX+85, "y": e.offsetY}, {"x": e.offsetX+80, "y": e.offsetY-4}, {"x": e.offsetX+80, "y": e.offsetY}]
                drawnObject = svgContainer.append("path")
                    .attr("d", lineFunction(lineData))
                    .attr("stroke", "#5B9BD5")
                    .attr("stroke-width", 1)
                    .attr("transform", "rotate(45 "+ e.offsetX+" "+ e.offsetY+")")
                    .attr("fill", "#5B9BD5")
                    .attr("class", 'drawnObject')
                    .attr("id", 'object'+objectNum)
                    .on("mouseover", function(){d3.select(this).style("cursor", "move");})
                    .on("mouseout", function(){d3.select(this).style("cursor", "default");});
            }

            if(drawnObject){
                drawnObject_class = drawnObject.attr('class');
                drawnObject_id = drawnObject.attr('id');
                callback(drawnObject_class,drawnObject_id);
            }

            $('.canvas').css({ cursor:'default'})
        };


        function allFlagFalse(){
                textboxClickStatus=false, rectClickStatus=false, circleClickStatus=false, triangleClickStatus=false, simpleArrowClickStatus_1=false,
                simpleArrowClickStatus_2=false, interArrowClickStatus_1=false, interArrowClickStatus_2=false, lineClickStatus=false, lineArrowStatus=false
        }

        $('.canvas').mousedown(function(e){

        }).mouseup(function(e){
                console.log(e.offsetX, e.offsetY)
                console.log($('.canvas'))
               drawByClick(e, object_added)
               allFlagFalse();
        })



        /*
         *      콜백 함수
         */
        function object_added(objectClass, objectID,e){
            objectNum++;
            console.log(objectClass)
            console.log(objectID)
            console.log(objectNum)

            // 현재 슬라이드를 클론
            console.log(objectID)
            console.log(e)
            var jsonSlide = JSON.stringify({  data:$('.canvas-container').html() })
            socket.emit('saveSlide',pptURL, jsonSlide);

        }
    }
});

