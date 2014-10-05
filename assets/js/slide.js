/*
 *  슬라이드의 캔버스 : canvas
 *  슬라이드의 미니맵 : cloneSlide
 *  canvas의 SVG : slideSVG
 */

var svgContainer;
var slideNum=1;
var currentSlideNum;
var x = 0;
var y = 0;
var a;

var textboxClickStatus, rectClickStatus, circleClickStatus, triangleClickStatus, simpleArrowClickStatus_1,
    simpleArrowClickStatus_2, interArrowClickStatus_1, interArrowClickStatus_2, lineClickStatus, lineArrowStatus;

$(document).ready(function(){
    var win = $(window),
        logo = $('#logo'),
        userList = $('#userList'),
//        slide = $('.canvas'),
        textboxBtn = $('#textbox'), rectBtn =  $('#rect'),  circleBtn = $('#circle'),   triangleBtn = $('#triangle'), simpleArrowBtn_1 =$('#simple_arrow1'), uploadImageBtn = $('#uploadImage'),
        simpleArrowBtn_2=$('#simple_arrow2'), interArrowBtn_1 =$('#inter_arrow1'), interArrowBtn_2 = $('#inter_arrow2'), lineBtn = $('#line'), lineArrowBtn = $('#line_arrow'),
        addSlideBtn = $('#addSlide'), delSlideBtn = $('#delSlide'), inviteBtn = $('#inviteBtn'),slideshowtBtn=$('#slideshowtBtn'),slideShowBox=$('#slideShowBox'),
        animation_popup_box =$('#animation_popup_box'),animation_popupBox_Close=$('#animation_popupBox_Close'),animation=$('#animation'),
        animation_appear=$('#animation_appear'),animation_pushl=$('#animation_pushl'),animation_pushr=$('#animation_pushr');

    var userID = $('.profilePicture').attr('id'),
        pptURL = $('#logo').attr('class')
    var initPPTData = $('.tempPPT').attr('id');

    if(initPPTData != 'notUploadPPT'){
        console.log(initPPTData)
        var uploadedPPTdata = JSON.parse(initPPTData);
        console.log(uploadedPPTdata)
    }



    //----------------------------chattting-------------------------------
    win.load(function(){
        logo.css({ left:win.innerWidth()/2-logo.width()/2 })
        socket.emit('joinroom',{room : pptURL, userID : userID, isSucess : false});
        /* 추가할 부분 : 첫번째 PPT가 선택이 되도록(보여주도록)*/

        socket.emit('getAmountSlideNum', pptURL);
//        slideSetting();
    })

    function initSetting(){
        localStorage.setItem('objectNum', 0);
//        $('.canvas-container div div').css('display','none');
//        $('#canvas1').css('display','block');
//        $('#slideTable div svg').css({border:'none'})
//        $('#cloneSlide1').css({border:'solid green'})
        currentSlideNum=1;

    }
    socket.emit('getSlideMembers',pptURL)

    socket.on('updatechat', function(username, data) {
        if(username === '')
            $("#chatRoom").append(data+'<br>');
        else{
            if(data !== '')
                $("#chatRoom").append('<b>'+username+':</b> '+data+'<br>');
        }
    });
    socket.on('userlist',function(data){
        $('#userList').empty();
        for(var i=0;i<data.users.length;i++){
            if(data.users[i].isLogin==true)
                userList.append('<div><img style="opacity: 1.0" src="'+data.users[i].profilePicture+'" class = "users" id="'+data.users[i].id+'"></div>')
            else if(data.users[i].isLogin==false){
                userList.append('<div><img style="opacity: 0.3" src="'+data.users[i].profilePicture+'" class = "users" id="'+data.users[i].id+'"></div>')
            }
        }
        initSetting();
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
        socket.emit('leaveroom',{pptURL:pptURL, userID:userID, isSucess:false});
    })
//----------------------------chattting-------------------------------

    socket.on('slideMembers', function(members, isNewSlide){
        //  *************** 새로운 슬라이드일 경우 ***************    //
        localStorage.setItem('slideNum', 1);
        slideNum=localStorage.getItem('slideNum');
        if(isNewSlide == 'new'){
            console.log(isNewSlide)
            $('.canvas-wrapper').append('<canvas id="c'+slideNum+'" width="950" height="534"></canvas>')
            var canvas = new fabric.Canvas('c1',{
                width : '950',
                height : '534',
                marginLeft :'140px',
                backgroundColor : 'white',
                selectionColor : "rgba(255, 193, 130,0.2)",
                selectionBorderColor :'rgb(204, 204, 204)',
                defaultCursor : 'default'
            });

            $('#slideTable').append('<canvas width="80" height="45" id="cloneSlide'+slideNum+'"></canvas>')
            var tmpp = $('#c'+slideNum);
//            a = setInterval(clone(tmpp),10);
            canvasCallbackSetting(canvas);

//            $('.canvas-container').append('<div id="canvasCon'+slideNum+'"><div class="canvas" id="canvas'+slideNum+'"></div></div>')
//            svgContainer = d3.select('#canvas'+slideNum+'').append('svg').attr('viewBox','0 0 ' + $('.canvas').width() +' '+$('.canvas').height())
//                .attr("version", 1.1).attr("xmlns", "http://www.w3.org/2000/svg").attr('id', 'slideSVG'+slideNum+'')

            var jsonSlide = JSON.stringify($('#canvasCon'+slideNum+'').html());
//            socket.emit('saveSlide',pptURL, jsonSlide, slideNum);
//            $('#cloneSlide'+slideNum).click(function(){
//                var clickedSlideMini = $(this).attr('id')
//                var clickedSlideSVG = $(this).children().attr('xlink:href');
//                $('.canvas-container div div').css('display','none');
//                $(clickedSlideSVG).parent().css('display','block');
//                svgContainer = d3.select(clickedSlideSVG)
//                $('#slideTable div svg').css({border:'none'})
//                socket.emit('slideClick',pptURL, slideNum, userID);
//                $('#'+clickedSlideMini).css({border:'solid green'})
//                var str=clickedSlideSVG;
//                slideNum=str.split("#slideSVG")[1];
//                currentSlideNum=slideNum;
//            })
//            slideSetting()
        }
        // ************** 기존에 불러온 슬라이드일 경우 ***************    //
        else if(isNewSlide=='old'){
            console.log('load Exist Slide')
            socket.emit('getExistSlideSVG', pptURL)
            socket.on('slideSVG', function(pptContents){
                console.log(pptContents)
                for(var i=0; i<pptContents.length; i++){
                    console.log(slideNum)
                    j=i+1;
                    $('.canvas-container').append('<div id="canvasCon'+j+'">' + jQuery.parseJSON(pptContents[i]) + '</div>');

                }
                socket.emit('getObjectNumforEvent', pptURL);
                slideNum = 1;
                svgContainer = d3.select('#slideSVG'+slideNum+'')
                    .attr('id', 'slideSVG'+slideNum+'')

                for(var i=1; i<=pptContents.length;i++){
                    $('#slideTable').append('<div><svg id="cloneSlide'+i+'" viewbox="0 0 80 45"><use xlink:href="#slideSVG'+i+'"></use></div>')
                    $('#cloneSlide'+i).click(function(){
                        var clickedSlideMini = $(this).attr('id')
                        var clickedSlideSVG = $(this).children().attr('xlink:href');
                        $('.canvas-container div div').css('display','none');
                        $(clickedSlideSVG).parent().css('display','block');
                        svgContainer = d3.select(clickedSlideSVG)
                        $('#slideTable div svg').css({border:'none'})
                        socket.emit('slideClick',pptURL, slideNum, userID);
                        $('#'+clickedSlideMini).css({border:'solid green'})
                        var str=clickedSlideSVG;
                        slideNum=str.split("#slideSVG")[1];
                        currentSlideNum=slideNum;
                        console.log('current SlideNum : ' + slideNum)
                    })
                }
                $('.canvas-container div div').css('display','none');
                $('#cloneSlide1').css({border:'solid green'})
                $('#slideSVG1').parent().css({display:"block"})
                slideSetting();
            })
        }
        else if (isNewSlide=='upload'){
            /* ******************** upload 슬라이드일 경우 ********************* */
            console.log('load uploaded PPT')
            socket.emit('isUploadPPT',pptURL);
            var temp = Object.keys(uploadedPPTdata);
            for(var i=0; i<temp.length; i++){
                var t = i+1;
                var ab = temp[i];
                var cd = uploadedPPTdata[ab];
                var tmp = cd[0].replace('canvas','canvas'+t).replace('slideSVG','slideSVG'+t)
                var ttmp = cd[1];
                console.log(ttmp)
                if(tmp.indexOf("/users")==-1) {
                    var tmp_2 = tmp.replace('"/Users/SW/Desktop/w3slides/','"');
                    var result = tmp_2.replace("/slides","");
                }
                console.log(result)
                $('.canvas-container').append(('<div id="canvasCon'+t+'">'+result+'</div>'))
                $('#slideTable').append('<div><svg id="cloneSlide'+t+'" viewbox="0 0 80 45"><use xlink:href="#slideSVG'+t+'"></use></div>')
                $('#cloneSlide'+t).click(function(){
                    var clickedSlideMini = $(this).attr('id');
                    var clickedSlideSVG = $(this).children().attr('xlink:href');
                    $('.canvas-container div div').css('display','none');
                    $(clickedSlideSVG).parent().css('display','block');
                    svgContainer = d3.select(clickedSlideSVG);
                    $('#slideTable div svg').css({border:'none'});
                    socket.emit('slideClick',pptURL, slideNum, userID);
                    $('#'+clickedSlideMini).css({border:'solid green'});
                    var str=clickedSlideSVG;
                    slideNum=str.split("#slideSVG")[1];
                    currentSlideNum=slideNum;
                    console.log('current SlideNum : ' + slideNum);
                })
                makeDragResizable(userID, 'object'+t, pptURL);
                $('#slideSVG'+slideNum);
                $('#slideSVG'+t).attr('value', $('#slideSVG'+t).text())
                var jsonSlide = JSON.stringify($('#canvasCon'+t+'').html());
                console.log(jsonSlide)
                socket.emit('saveSlide',pptURL,jsonSlide,t);
            }
            $('.canvas-container div div').css('display','none');
            $('#cloneSlide1').css({border:'solid green'})
            $('#slideSVG1').parent().css({display:"block"})
            svgContainer = d3.select('#slideSVG1')
            slideSetting();
            socket.emit('saveObjNum',pptURL,ttmp);
            socket.emit('slideStatus', pptURL,'old');
            $('.tempPPT').attr('id', " ");
        }
    });


    inviteBtn.click(function(){
        console.log('asdadadasda')
        loadPopupBox();
    })
    $(function() {
        $("#mail").click( function() {
            var mailad = $("#inputEmail").val();
            $("#inputEmail").val('');
            console.log(mailad);
            function getUrlAddress(){
                var pageUrl = document.location;
                pageUrl  = new String(pageUrl);
                return pageUrl.substring(0,pageUrl.lastIndexOf("/"));
            }
            var urladd =getUrlAddress();
            var presenturl = urladd+'/'+pptURL
            console.log(presenturl);
            console.log(userID);

            socket.emit('send_mail', mailad,presenturl,userID);
        });

        $("#data").keypress(function(e) {
            if (e.which == 13){
                $(this).blur();
                $("#send").click();
                $("#data").focus();
            }
        });
    });
    // When site loaded, load the Popupbox First
    $('#popupBoxClose').click(function(){

        unloadPopupBox();
    });

    socket.on('Sucessmail',function(data){
        alert('Sucess send mail to'+' '+data+'!')
        unloadPopupBox();
    });

    function unloadPopupBox() {    // TO Unload the Popupbox
        $('#popup_box').fadeOut("slow");
        inviteBtn.css({ // this is just for style
            "opacity": "1"
        });
    }
    function loadPopupBox() {
        $('#popup_box').fadeIn("slow");
        inviteBtn.css({
            "opacity": "0.3"
        });
    }


    //invite someone end

//------------------tool bar select Animation !!!-----------------------------
    function unloadAniBtn() {    // TO Unload the Popupbox
        animation_popup_box.fadeOut("slow");
        animation.css({ // this is just for style
            "opacity": "1"
        });
    }
    function loadAniBtn() {
        animation_popup_box.fadeIn("slow");
        animation.css({
            "opacity": "0.3"
        });
    }
    animation.click(function(){

        loadAniBtn();
    })
    animation_popupBox_Close.click(function(){
        unloadAniBtn();
    });

    animation_appear.click(function(){
        $('#slideSVG'+slideNum).attr('value','appear');
        var animation = $('#slideSVG'+slideNum).val();

        unloadAniBtn();
    });
    animation_pushl.click(function(){
        $('#slideSVG'+slideNum).attr('value','push_l');

        unloadAniBtn();
    });
    animation_pushr.click(function(){
        $('#slideSVG'+slideNum).attr('value','push_r');
        unloadAniBtn();


    });

//------------------tool bar Animation end !!!-----------------------------
    //--------------------------버튼 이밴트!!!--------------

    function unloadShowBox() {    // TO Unload the Popupbox
        slideShowBox.hide();
        slideshowtBtn.css({ // this is just for style
            "opacity": "1"
        });
    }
    function loadShowBox() {
        slideShowBox.show();
        slideshowtBtn.css({
            "opacity": "0.3"
        });
    }
//-------------수정부분//---------------------------------------------

    slideshowtBtn.mousedown(function(){
//        socket.emit('getAmountSlideNum', pptURL);
    }).mouseup(function(){
            console.log(localStorage.getItem('slideNum'));
            for(var i=1;i<=localStorage.getItem('slideNum');i++){
                var html = d3.select("#slideSVG"+i)
                    .attr("version", 1.1)
                    .attr("xmlns", "http://www.w3.org/2000/svg")
                    .node().parentNode.innerHTML;
                var imgsrc = 'data:image/svg+xml;base64,'+ btoa(html);
                var img = '<img src="'+imgsrc+'"class = "sp" id="slideSVG'+i+'">';
                console.log('<img src="'+imgsrc+'"class = "sp" id="'+i+'">')
                //        d3.select("#slider").html(img)
                $('#slider').append('<img src="'+imgsrc+'"class = "sp" id="slideSVG'+i+'">')
            }
//-------------낵스트 버튼 클릭 이밴트!!!----------------------------------
            $('.sp').first().addClass('active');
            $('.sp').hide();
            $('.active').show();

            var N=1;
            $('#button-next').click(function(){
                $('.active').removeClass('active').addClass('oldActive');
                if ( $('.oldActive').is(':last-child')) {
                    $('.sp').first().addClass('active');
                }
                else{
                    N=1;
                    $('.oldActive').next().addClass('active');
                }
                $('.oldActive').removeClass('oldActive');


                    $('.sp').hide();
                    $('.active').show();


            })

            $('#button-previous').click(function(){
                $('.active').removeClass('active').addClass('oldActive');
                if ( $('.oldActive').is(':first-child')) {
                    $('.sp').last().addClass('active');
                }
                else{
                    $('.oldActive').prev().addClass('active');
                }
                $('.oldActive').removeClass('oldActive');
                $('.sp').hide();
                $('.active').show();
            });
            loadShowBox();

        });
//----------------------수정 부분  끝//----------------
    $('#slideShowBoxClose').click(function(){
        unloadShowBox();
        $('#slider').empty();
    });
//-------------------------------slideShow------------------------

    //--------------------------버튼 이밴트!!!--------------

    //--------------------------버튼 이밴트!!!--------------

    function unloadShowBox() {    // TO Unload the Popupbox
        slideShowBox.fadeOut("slow");
        slideshowtBtn.css({ // this is just for style
            "opacity": "1"
        });
    }
    function loadShowBox() {
        slideShowBox.fadeIn("slow");
        slideshowtBtn.css({
            "opacity": "0.3"
        });
    }


    slideshowtBtn.click(function(){

        console.log('asdasdasdasdasd')
        loadShowBox();
    })
    $('#slideShowBoxClose').click(function(){
        unloadShowBox();
    });

    /*
     Sub_tool end
     */
//------------------tool bar Animation !!!-----------------------------
    function unloadAniBtn() {    // TO Unload the Popupbox
        animation_popup_box.fadeOut("slow");
        animation.css({ // this is just for style
            "opacity": "1"
        });
    }
    function loadAniBtn() {
        animation_popup_box.fadeIn("slow");
        animation.css({
            "opacity": "0.3"
        });
    }
    animation.click(function(){

        console.log('asdasdasdasdasd')
        loadAniBtn();
    })

    animation_popupBox_Close.click(function(){
        unloadAniBtn();
    });

    animation_appear.click(function(){
       $('#slideSVG'+slideNum).attr('value','fade');
        unloadAniBtn();
    });


    animation_pushl.click(function(){
        $('#slideSVG'+slideNum).attr('value','pushl');
//
        unloadAniBtn();
    });
    animation_pushr.click(function(){
        $('#slideSVG'+slideNum).attr('value','pushr');
        unloadAniBtn();
    });

//------------------tool bar Animation end !!!-----------------------------


    /*
     *       SVG를 이용한 PowerPoint Editor
     */


    var lineFunction = d3.svg.line()
        .x(function(d) { return d.x; })
        .y(function(d) { return d.y; })
        .interpolate("linear");


    textboxBtn.click(function(e){ allFlagFalse();$('.G').attr('transform', 'scale(0.8)'); textboxClickStatus=true; $('.canvas').css({ cursor:'crosshair'}) })
    rectBtn.click(function(e){ allFlagFalse(); rectClickStatus=true; $('.canvas').css({ cursor:'crosshair'}) })
    circleBtn.click(function(e){ allFlagFalse(); circleClickStatus=true; $('.canvas').css({ cursor:'crosshair'}) })
    triangleBtn.click(function(e){ allFlagFalse(); triangleClickStatus=true; $('.canvas').css({ cursor:'crosshair'}) })
    simpleArrowBtn_1.click(function(e){ allFlagFalse(); simpleArrowClickStatus_1=true; $('.canvas').css({ cursor:'crosshair'}) })
    simpleArrowBtn_2.click(function(e){ allFlagFalse(); simpleArrowClickStatus_2=true; $('.canvas').css({ cursor:'crosshair'}) })
    interArrowBtn_1.click(function(e){ allFlagFalse(); interArrowClickStatus_1=true; $('.canvas').css({ cursor:'crosshair'}) })
    interArrowBtn_2.click(function(e){ allFlagFalse(); interArrowClickStatus_2=true; $('.canvas').css({ cursor:'crosshair'}) })
    lineBtn.click(function(e){ allFlagFalse(); lineClickStatus=true; $('.canvas').css({ cursor:'crosshair'}) })
    lineArrowBtn.click(function(e){ allFlagFalse(); lineArrowStatus=true; slide.css({ cursor:'crosshair'}) })



    socket.on('amountSlideNum', function(slideNum){
        slideNum=slideNum+1;
        console.log('amountSlideNum : ' + slideNum)
        localStorage.setItem('slideNum', slideNum);
    })


    delSlideBtn.mousedown(function(e){
        console.log(currentSlideNum)
        $('#cloneSlide'+currentSlideNum+'').parent().remove();
        $('#canvasCon'+currentSlideNum+'').remove();
        socket.emit('delSlide',pptURL, currentSlideNum);
        currentSlideNum--;
        $('#cloneSlide'+currentSlideNum+'').css({border:'solid green'})
        $('#canvas'+currentSlideNum+'').css({display:'block'})
        svgContainer = d3.select('#slideSVG'+currentSlideNum+'')
    })

    addSlideBtn.mousedown(function(e){
        socket.emit('getAmountSlideNum', pptURL);
        a = setInterval("clone($('#c'+slideNum+''))",10);
    })
    addSlideBtn.mouseup(function(e){
        slideNum++;
        var jsonSlide;
        $('.canvas-wrapper').append('<canvas id="c'+slideNum+'" width="950" height="534"></canvas>')
//        $('.canvas-container').append('<div id="canvasCon'+slideNum+'"><div class="canvas" id="canvas'+slideNum+'"></div></div>')
        var canvas = new fabric.Canvas('c'+slideNum+'',{
            width : '950',
            height : '534',
            marginLeft :'140px',
            backgroundColor : 'white',
            selectionColor : "rgba(255, 193, 130,0.2)",
            selectionBorderColor :'rgb(204, 204, 204)',
            defaultCursor : 'default'
        });
        $('#slideTable').append('<canvas width="80" height="45" id="cloneSlide'+slideNum+'"></canvas>')
        $('#cloneSlide'+slideNum).click(function(){
            $('#c'+slideNum-1).hide();
            clearInterval(a);

            $('#c'+slideNum).show();
            setInterval(clone($('#c'+slideNum)),10);
//
//
//
//            var clickedSlideMini = $(this).attr('id')
//            var clickedSlideSVG = $(this).children().attr('xlink:href');
//            $('.canvas-container div div').css('display','none');
//            $(clickedSlideSVG).parent().css('display','block');
//            svgContainer = d3.select(clickedSlideSVG)
//            $('#slideTable div svg').css({border:'none'})
//            socket.emit('slideClick',pptURL, slideNum, userID);
//            $('#'+clickedSlideMini).css({border:'solid green'})
//            var str=clickedSlideSVG;
//            slideNum=str.split("#slideSVG")[1];
//            currentSlideNum=slideNum
//            console.log('current SlideNum : ' + slideNum)
//            socket.emit('slideClick',pptURL, slideNum, userID);
        })

//        $('#slideTable div svg').css({border:'none'})
//        $('#cloneSlide'+slideNum).css({border:'solid green'})
//        currentSlideNum=slideNum
//        jsonSlide = JSON.stringify($('#canvasCon'+slideNum+'').html());
//        socket.emit('saveSlide',pptURL, jsonSlide, slideNum);
//        socket.emit('addSlide',pptURL, slideNum, userID);
//        $('#cloneSlide'+slideNum).click(function(){
//            var clickedSlideMini = $(this).attr('id')
//            var clickedSlideSVG = $(this).children().attr('xlink:href');
//            $('.canvas-container div div').css('display','none');
//            $(clickedSlideSVG).parent().css('display','block');
//            svgContainer = d3.select(clickedSlideSVG)
//            $('#slideTable div svg').css({border:'none'})
//            socket.emit('slideClick',pptURL, slideNum, userID);
//            $('#'+clickedSlideMini).css({border:'solid green'})
//            var str=clickedSlideSVG;
//            slideNum=str.split("#slideSVG")[1];
//            currentSlideNum=slideNum
//            console.log('current SlideNum : ' + slideNum)
//            socket.emit('slideClick',pptURL, slideNum, userID);
//        })
//        slideSetting();
    });

    function slideSetting(){
        objectNum = localStorage.getItem('objectNum');
        uploadImageBtn.click(function(e){
            document.getElementById('file-input').onchange = function handleImage(e){
                btnImageClicked = true;

                var reader = new FileReader();
                reader.onload = function (event) {
                    var imgObj = new Image();
                    imgObj.src = event.target.result;
                    imgObj.onload = function () {
                        var image = new fabric.Image(imgObj);
                        image.set({
                            left: 100,
                            top: 200,
                            padding: 10,
                            subName : 'object' + objectNum
                        });
                        canvas.add(image)
//                        socket.emit('addObjToCanvas', image, beeObjectIndex);
                    }

                }
                reader.readAsDataURL(e.target.files[0]);
            }
        });







        function object_added(objectClass, objectID,e){
            x=0;y=0;

            allFlagFalse();
            console.log('amountObjectNum : ' + localStorage.getItem('objectNum'))

            $('#'+objectID).click(function(e){
//                console.log('make select box')
//                $('#'+objectID).wrapAll("<g/>");
//                $('#'+objectID).parent().attr('transform','scale(10)')
                e.stopPropagation();
            })
            $(document).click(function() {
                console.log('clicked outside');
            });
//            $('#'+ e.target.id).selectAll
//            var newg = $('#'+ e.target.id).append("g")
//                .data([{x: width / 2, y: height / 2}]);
//            var dragrect = newg.append("rect")
//                .attr("id", "active")
//                .attr("x", function(d) { return d.x; })
//                .attr("y", function(d) { return d.y; })
//                .attr("height", height)
//                .attr("width", width)
//                .attr("fill-opacity", .5)
//                .attr("cursor", "move")
//                .call(drag);

            var str= e.target.id
            slideNum=str.split("slideSVG")[1];
            var obj = $('#'+objectID).clone().wrapAll("<div/>").parent().html();

            var jsonSlide = JSON.stringify($('#canvasCon'+slideNum+'').html());
            makeDragResizable(userID, objectID, pptURL);
            socket.emit('saveSlide', pptURL, jsonSlide, slideNum);
            socket.emit('addObject', pptURL, obj, currentSlideNum, userID);
        }

        $('.canvas').mousedown(function(e){
            socket.emit('getObjectNum', pptURL);
        }).mouseup(function(e){


            })
    };

    /*
     *
     */




    socket.on('addedSlide', function(slideNum, addedUserId){
        if(userID != addedUserId){
            $('.canvas-container').append('<div id="canvasCon'+slideNum+'"><div class="canvas" id="canvas'+slideNum+'"></div></div>')
            svgContainer = d3.select('#canvas'+slideNum+'').append('svg')
                .attr('viewBox','0 0 ' + $('.canvas').width() +' '+$('.canvas').height())
                .attr("version", 1.1).attr("xmlns", "http://www.w3.org/2000/svg").attr('id', 'slideSVG'+slideNum+'')
            $('#slideTable').append('<div><svg id="cloneSlide'+slideNum+'" viewbox="0 0 80 45"><use xlink:href="#slideSVG'+slideNum+'"></use></div>')
            localStorage.setItem('slideNum', slideNum);
            $('#cloneSlide'+slideNum).click(function(){
                var clickedSlideMini = $(this).attr('id')
                var clickedSlideSVG = $(this).children().attr('xlink:href');
                $('.canvas-container div div').css('display','none');
                $(clickedSlideSVG).parent().css('display','block');
                svgContainer = d3.select(clickedSlideSVG)
                $('#slideTable div svg').css({border:'none'})
                socket.emit('slideClick',pptURL, slideNum, userID);
                $('#'+clickedSlideMini).css({border:'solid green'})
                var str=clickedSlideSVG;
                slideNum=str.split("#slideSVG")[1];
                currentSlideNum=slideNum;
                console.log('current SlideNum : ' + slideNum)
                slideSetting();
            })
        }
    });
    socket.on('addedObject', function(obj, slideNum, addedUserId, objNum){
        if(userID != addedUserId){
            tempNum = objNum-1;
            makeDragResizable(userID, 'object'+tempNum, pptURL);
            $('#slideSVG'+slideNum).append(obj);
            // safari에서 안먹힘
            $('#slideSVG'+slideNum).html($('#slideSVG'+slideNum).html());

        }
    });
    socket.on('updateObject', function(addedUserId, mod_objectID, mod_style){
        if(userID != addedUserId){
            $('#'+mod_objectID).attr('style', mod_style);
            slideSetting();
            makeDragResizable(userID, mod_objectID, pptURL)
            $('#slideSVG'+slideNum).html($('#slideSVG'+slideNum).html());
            $('#sidebarTable').html($('#sidebarTable').html());

        }
    })

    socket.on('objectNum',function(objectNum){
        // temp
        localStorage.setItem('objectNum', objectNum+1);
    });

    socket.on('slideClicked',function(slideNum, addedUserId, username){
        if(userID != addedUserId){
            $('#slideTable div svg').css({border:'none'})
            $('#slideTable div svg').removeAttr("title");
            $('#cloneSlide'+currentSlideNum).css({ border : 'solid green'})
            $('#cloneSlide'+slideNum).css({ border : 'solid red'})
            $('#cloneSlide'+slideNum).attr('title',username);
            $('#cloneSlide'+slideNum).tooltip({ position: { my: "left+15 center", at: "right" } });

        }

    })
    socket.on('objectNumforEvent',function(objNum){
        console.log('aasdfa')
        for(var i=0; i<objNum; i++){
            console.log('object'+i)
            makeDragResizable(userID, 'object'+i , pptURL);
        }
    })


});


function canvasCallbackSetting(canvas){
    canvas.on('object:added',function(e){
        allFlagFalse();
        console.log(e)
        console.log(e.target);
        e.target.setCoords();
    })
    canvas.on("mouse:down", function(e){
//            socket.emit('getObjectNum', pptURL);
        console.log(e.target)

    }).on("mouse:up",function(e){
            drawByClick(e);
            canvas.renderAll();
        })

    function drawByClick(e){
        console.log(e.e.offsetX)
        console.log(e.e.offsetY)
        var drawnObject;
        objectNum = localStorage.getItem('objectNum');
        if(textboxClickStatus==true){
            var text = new fabric.IText('Enter the Text',{
                   left: e.e.offsetX,
                   top: e.e.offsetY,
                   strokeMiterLimit:5,
                   minScaleLimit:0.5,
                    fontSize:15,
                   // customized
                   subName : 'object' + objectNum
            })
            canvas.add(text);
            // add socket
            canvas.calcOffset();

            // text socket
//            text.on("editing:exited",function(e){
//                socket.emit('modifyCanvas', text, text.originalState);
//            })
        }
        else if(rectClickStatus==true){
            var rect = new fabric.Rect({
                left: e.e.offsetX,
                top: e.e.offsetY,
                fill : '#5B9BD5',
                width : 70,
                height: 70,

                // customized
                subName : 'object' + objectNum
            });
            // will be socket
            canvas.add(rect);
        }
        else if(circleClickStatus==true){

            var circle = new fabric.Circle({
                left: e.e.offsetX,
                top: e.e.offsetY,
                fill: '#F6822B',
                radius :45,
                borderWidth :1,
                fill : '#5B9BD5',

                // customized
                subName : 'object' + objectNum
            });
            // will be socket
            canvas.add(circle);
//        .attr("style", "fill:#5B9BD5; stroke-width:1; stroke:rgb(0,0,0)")

            // add socket
//            socket.emit('addObjToCanvas', circle, beeObjectIndex);
            canvas.calcOffset();
        }
        else if(triangleClickStatus==true){
            var triangle = new fabric.Triangle({
                left: e.e.offsetX,
                top: e.e.offsetY,
                fill : '#5B9BD5',
                radius:40,
                // customized
                subName : 'object' + objectNum
            });
//        .attr("stroke", "black")
//                .attr("stroke-width", 1)

            canvas.add(triangle)
            // add socket
//            socket.emit('addObjToCanvas', triangle, beeObjectIndex);
            canvas.calcOffset();
        }
        else if(simpleArrowClickStatus_1==true){
            var sim_arrow_1 = '<path d="M627,87L702,87L702,102L727,72L702,42L702,57L627,57L627,87" stroke="black" stroke-width="1" fill="#5B9BD5" class="drawnObject" id="object15" style="cursor: default; transform: translate(0px, -1px); -webkit-transform: translate(0px, -1px);" data-x="912" data-y="290"></path>'
            fabric.loadSVGFromString(sim_arrow_1, function (objects, options) {
                var loadedObject = fabric.util.groupSVGElements(objects, options);
                loadedObject.set({
                    left: e.e.offsetX,
                    top: e.e.offsetY,
                    fill : '#5B9BD5',
                    subName : 'object' + objectNum
                });
                loadedObject.setCoords();
                canvas.add(loadedObject);
                canvas.calcOffset();
            });
        }
        else if(simpleArrowClickStatus_2==true){
            var sim_arrow_1 = '<path d="M627,87L702,87L702,102L727,72L702,42L702,57L627,57L627,87" stroke="black" stroke-width="1" fill="#5B9BD5" class="drawnObject" id="object15" style="cursor: default; transform: translate(0px, -1px); -webkit-transform: translate(0px, -1px);" data-x="912" data-y="290"></path>'
            fabric.loadSVGFromString(sim_arrow_1, function (objects, options) {
                var loadedObject = fabric.util.groupSVGElements(objects, options);
                loadedObject.set({
                    left: e.e.offsetX,
                    top: e.e.offsetY,
                    fill : '#5B9BD5',
                    subName : 'object' + objectNum
                });
                loadedObject.setCoords();
                canvas.add(loadedObject);
                canvas.calcOffset();
            });
        }
        else if(interArrowClickStatus_1==true){
            var sim_arrow_1 = '<path d="M627,87L702,87L702,102L727,72L702,42L702,57L627,57L627,87" stroke="black" stroke-width="1" fill="#5B9BD5" class="drawnObject" id="object15" style="cursor: default; transform: translate(0px, -1px); -webkit-transform: translate(0px, -1px);" data-x="912" data-y="290"></path>'
            fabric.loadSVGFromString(sim_arrow_1, function (objects, options) {
                var loadedObject = fabric.util.groupSVGElements(objects, options);
                loadedObject.set({
                    left: e.e.offsetX,
                    top: e.e.offsetY,
                    fill : '#5B9BD5',
                    subName : 'object' + objectNum
                });
                loadedObject.setCoords();
                canvas.add(loadedObject);
                canvas.calcOffset();
            });
        }
        else if(interArrowClickStatus_2==true){
            var sim_arrow_1 = '<path d="M627,87L702,87L702,102L727,72L702,42L702,57L627,57L627,87" stroke="black" stroke-width="1" fill="#5B9BD5" class="drawnObject" id="object15" style="cursor: default; transform: translate(0px, -1px); -webkit-transform: translate(0px, -1px);" data-x="912" data-y="290"></path>'
            fabric.loadSVGFromString(sim_arrow_1, function (objects, options) {
                var loadedObject = fabric.util.groupSVGElements(objects, options);
                loadedObject.set({
                    left: e.e.offsetX,
                    top: e.e.offsetY,
                    fill : '#5B9BD5',
                    subName : 'object' + objectNum
                });
                loadedObject.setCoords();
                canvas.add(loadedObject);
                canvas.calcOffset();
            });
        }
        else if(lineClickStatus==true){
            var sim_arrow_1 = '<path d="M627,87L702,87L702,102L727,72L702,42L702,57L627,57L627,87" stroke="black" stroke-width="1" fill="#5B9BD5" class="drawnObject" id="object15" style="cursor: default; transform: translate(0px, -1px); -webkit-transform: translate(0px, -1px);" data-x="912" data-y="290"></path>'
            fabric.loadSVGFromString(sim_arrow_1, function (objects, options) {
                var loadedObject = fabric.util.groupSVGElements(objects, options);
                loadedObject.set({
                    left: e.e.offsetX,
                    top: e.e.offsetY,
                    fill : '#5B9BD5',
                    subName : 'object' + objectNum
                });
                loadedObject.setCoords();
                canvas.add(loadedObject);
                canvas.calcOffset();
            });
        }
        else if(lineArrowStatus==true){
            var sim_arrow_1 = '<path d="M627,87L702,87L702,102L727,72L702,42L702,57L627,57L627,87" stroke="black" stroke-width="1" fill="#5B9BD5" class="drawnObject" id="object15" style="cursor: default; transform: translate(0px, -1px); -webkit-transform: translate(0px, -1px);" data-x="912" data-y="290"></path>'
            fabric.loadSVGFromString(sim_arrow_1, function (objects, options) {
                var loadedObject = fabric.util.groupSVGElements(objects, options);
                loadedObject.set({
                    left: e.e.offsetX,
                    top: e.e.offsetY,
                    fill : '#5B9BD5',
                    subName : 'object' + objectNum
                });
                loadedObject.setCoords();
                canvas.add(loadedObject);
                canvas.calcOffset();
            });
        }

        $('.canvas').css({ cursor:'default'})
    };
}
function allFlagFalse(){
    textboxClickStatus=false, rectClickStatus=false, circleClickStatus=false, triangleClickStatus=false, simpleArrowClickStatus_1=false,
        simpleArrowClickStatus_2=false, interArrowClickStatus_1=false, interArrowClickStatus_2=false, lineClickStatus=false, lineArrowStatus=false
}

//function clone(old){
//    var newCanvas = document.getElementById('c'+slideNum+'');
//    var context = newCanvas.getContext('2d');
//
//    context.drawImage(old, 0,0, 80, 45);
//    return newCanvas;
//}