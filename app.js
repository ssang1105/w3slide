/*
 접속자 추적하려면 넣자
 var logger = require('morgan');
 app.use(logger());
 */
var express = require('express'),
    router = express.Router();
var bodyPaser = require('body-parser');
var http = require('http');
var path = require('path');
var app = express();
var mongoose = require('mongoose');
var session = require('express-session');
var passport = require('passport'),
    FacebookStrategy = require('passport-facebook').Strategy,
    GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var fs = require('fs');
var methodOverride = require('method-override');
var errorhandler = require('errorhandler');
var cookieParser = require('cookie-parser')
var socketio = require('socket.io');
var nodemailer = require('nodemailer');

///woong
var unzip = require('unzip');
var SocketIOFileUpload = require('socketio-file-upload');
var readdir = require('./modules/search.js');
var load = require('./modules/load.js');

app.use(cookieParser());
app.use(session({ secret: 'your secret here' }));
app.use(express.static(__dirname));
app.use(methodOverride('X-HTTP-Method-Override'));
app.set('port', process.env.PORT || 3000);
app.use(bodyPaser.json());
app.use(bodyPaser.urlencoded());
app.use(passport.initialize());
app.use(passport.session());
app.set('view engine', 'ejs');

server = http.createServer(app).listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
});

var io = socketio.listen(server);
io.set('log level', 1);

var UserSchema = new mongoose.Schema({
        provider : String,
        id : String,
        username: String,
        email: { type : String , lowercase : true},
        projectList : [String],
        profilePicture : String,
        projectNum : Number
    }
);
var PPTSchema = new mongoose.Schema({
    fileName : String,
    members : [{
        name : String,
        profilePicture: Object,
        email : String,
        id : String,
        isLogin : Boolean
    }],
    createdDate : Date,
    pptContents : [String],
    thumbnail : String,
    id : String,
    url : String,
    isNewSlide : String,
    objectNum : Number
})

var PPTs = mongoose.model('ppts', PPTSchema);
var Users = mongoose.model('users',UserSchema);

if (process.env.NODE_ENV === 'development') {
    app.use(errorhandler())
}

passport.use(new GoogleStrategy({
        /*
         https://code.google.com/apis/console/b/0/?noredirect#project:798570766353:access 에서 세팅
         */
        clientID: '798570766353-grel6lkpudf677bj7plabec6u799oeq5.apps.googleusercontent.com',
        clientSecret: 'HgNuWAGmURXrDZs2TsuRQ9V7',
        callbackURL: 'http://localhost:3000/auth/google/callback',
        scope: [
            'https://www.googleapis.com/auth/plus.login',
            'https://www.googleapis.com/auth/userinfo.email'
        ]
    },
    function(accessToken, refreshToken, profile, done) {
        Users.findOne({ id: profile.id }, function (err, oldUser) {
            if(oldUser){
                done(null,oldUser);
            }else{
                var newUser = new Users({
                    provider : profile.provider,
                    id : profile.id,
                    username: profile.displayName,
                    email: profile.emails[0].value,
                    profilePicture : profile._json.picture,
                    projectNum:0
                }).save(function(err,newUser){
                        if(err) throw err;
                        done(null, newUser);
                    });
            }
        });
    }
));

passport.use(new FacebookStrategy({
        /*
         https://developers.facebook.com/apps/698552830212995/settings/ 에서 세
         */
        clientID :'698552830212995',
        clientSecret : 'c28eb14acf960f3e912086a6dddd9f7d',
        callbackURL : 'http://localhost:3000/auth/facebook/callback',
        profileFields: ['id', 'displayName', 'link', 'photos', 'emails'],
    },
    function(accessToken, refreshToken, profile, done) {
        console.log(accessToken)
        Users.findOne({id:profile.id}, function(err, oldUser){
            if(oldUser){
                done(null,oldUser);
            }else{
                console.log(profile)
                var newUser = new Users({
                    provider : 'Facebook',
                    id : profile.id,
                    username: profile.displayName,
                    email: profile.emails[0].value,
                    profilePicture : profile.photos[0].value,
                    projectNum:0
                }).save(function(err,newUser){
                        if(err) throw err;
                        done(null, newUser);
                    });
            }
        });
    }
))


passport.serializeUser(function(user,done){
    console.log('serialize');
    done(null,user);
});

passport.deserializeUser(function(user,done){
    console.log('deserialize');
    done(null,user);
})

app.get('/auth/google', passport.authenticate('google'))
app.get('/auth/google/callback',
    passport.authenticate('google', {
            successRedirect: '/login_success',
            failureRedirect: '/login_fail'
        }
    ));

app.get('/auth/facebook', passport.authenticate('facebook', {scope:['email'] }));
app.get('/auth/facebook/callback',
    passport.authenticate('facebook', {
        successRedirect: '/login_success',
        failureRedirect: '/login_fail',
        scope: ['email']
    })
);

app.get('/login_success', ensureAuthenticated, function(req, res, next){
    res.render('success_login', { profileImage : req.user.profilePicture, namespace:req.user.username, userID:req.user.id } )
});

app.get('/logout', ensureAuthenticated, function(req, res){
    req.logout();
    res.redirect('/');
});
function ensureAuthenticated(req, res, next) {
    // 로그인이 되어 있으면, 다음 파이프라인으로 진행
    if (req.isAuthenticated()) {  return next(); }
    // 로그인이 안되어 있으면, login 페이지로 진행
    res.redirect('/');
}


mongoose.connect('mongodb://localhost/mydb',function(err){
    if(err){
        console.log('mongoose connection error :'+err);
        throw err;
    }
});



io.sockets.on('connection', function (socket) {
    console.log('Socket Connected');

    ///////////////// upload start //////////////
    var uploader = new SocketIOFileUpload();
    uploader.dir = __dirname+"/upload/";
    uploader.listen(socket);

    uploader.on("saved", function(event){
        //console.log(event.file.name);
        var tmp = uploader.dir
        var nn_file = tmp + event.file.name;
        var n_file = event.file.name.replace('pptx', 'zip');
        var n_name = event.file.name.split('.pptx').join("");
        var nnn_file = tmp + n_file;
        var e_sld;

        fs.rename(nn_file, nnn_file , function(err){
            if(err) throw err;
            console.log('rename complete');
            fs.exists(nnn_file, function(exists){
                if(exists){
                    setTimeout(function(){
                        fs.createReadStream(tmp+ n_file).pipe(unzip.Extract({ path: tmp +n_name+'/' }));
                        console.log("unzip complete");
                    }, 1000);
                    setTimeout(function(){
                        var search = new readdir();
                        var loadx = new load();
                        var abc = loadx.load_pxml(tmp+n_name+'/ppt/presentation.xml');		//presentation.xml 가져오기
                        e_sld = search.search_detail(tmp+n_name+'/ppt/slides/_rels/', abc);

                        socket.emit("upload_complete", "complete");
                        socket.on("uploadPPT_URL", function(data){
                            var pptName = event.file.name;
                            var users = data.userID;
                            var pptURL = data.pptURL;
                            var isNewSlide = data.isNewSlide;
                            var pptImg = "./assets/image/index/samplePPT.png";
                            Users.findOne({'id': users},function(err,user){
                                var newSlides = new PPTs({
                                    fileName : pptName,
                                    members : {
                                        name : user.username,
                                        profilePicture: user.profilePicture,
                                        email : user.email,
                                        id : user.id,
                                        isLogin: true
                                    },
                                    createdDate : Date.now(),
                                    thumbnail : pptImg,
                                    id : user.id+user.projectNum+pptName,
                                    url : pptURL,
                                    isNewSlide : 'upload'
                                });
                                console.log(newSlides.id);
                                newSlides.members.push({ name : user.username, profilePicture:user.profilePicture, email:user.email, id:user.id, isLogin:true})
                                newSlides.save(function(err){ if(err) throw err; });
                                user.projectList.push(newSlides);
                                user.save();
                                app.get('/'+pptURL, ensureAuthenticated, function(req, res){
                                    tempSld = JSON.stringify(e_sld)
                                    res.render('slide', { pptURL:pptURL , uploadPPTData:tempSld});
                                });
                            });
                        });
                    }, 2200);
                }
            });
        });
    });

    uploader.on("error", function(event){
        console.log("Error from uploader", event);
    });

    //==========================chat!!====================================


    socket.on('joinroom',function(data){
        Users.findOne({'id':data.userID},function(err,user){
            if(err) throw err;
            PPTs.findOne({'url':data.room},function(err,ppt){
                if(err) throw  err;
                var oldUser = false;
                var pptMembersLength =ppt.members.length
                for(var j=0; j<pptMembersLength; j++){
                    for(var i=0; i<pptMembersLength; i++)
                        if(user.id==ppt.members[i].id){
                            ppt.members[i].isLogin=true;
                            ppt.save();
                            oldUser=true;
                            break;
                        }
                    if(oldUser==false){
                        ppt.members.push({name : user.username,profilePicture:user.profilePicture,email:user.email,id:user.id, isLogin:true});
                        ppt.save();
                        user.projectList.push(ppt);
                        user.save();
                        break;
                    }
                }
                var room = data.room;
                var username= user.username;
                socket.join(room);
                socket.room=room;
                socket.id=data.userID;
                socket.username = username;
                data.isSucess=true;

                var data1 = ('님이 입장하였습니다');
                io.sockets.in(socket.room).emit('updatechat',username,data1);
                io.sockets.in(socket.room).emit('userlist', {users :ppt.members,userID :user.id, isSucess :true});
            });
        });
    });

    socket.on('leaveroom',function(data){
        Users.findOne({'id':data.userID},function(err,user){
            if(err) throw err;
            PPTs.findOne({'url':data.pptURL},function(err,ppt){
                if(err) throw  err;
                var pptMembersLength =ppt.members.length
                for(var i=0; i<pptMembersLength; i++)
                    if(user.id==ppt.members[i].id){
                        ppt.members[i].isLogin=false;
                        ppt.save();
                    }

            console.log('nickname ' + user.username + ' has been disconnected');
            var data1 = (user.username + ' 님이 나가셨습니다.');
            io.sockets.in(socket.room).emit('updatechat',user.username,data1);
            io.sockets.in(socket.room).emit('userlist',{users :ppt.members,userID :user.id, isSucess :false});
            socket.leave(socket.room);
            });
        });
    });


    socket.on('send_msg', function(data) {
        io.sockets.in(socket.room).emit('updatechat', socket.username, data);
    });

    //==========================chat!!==================================== //
//-----------------------------send mail!!!!--------------------------
    socket.on('send_mail',function(data,presenturl,userID){
        Users.findOne({id:userID},function(err,user){
            if(err) throw err;
            var transporter = nodemailer.createTransport({
                service: 'Gmail',
                auth: {
                    user: 'genasix1@gmail.com',
                    pass: 'gksdnfl2'
                }
            });
            var mailOptions = {
                from: '<genamsix1@gmail.com>', // sender address
                to: ''+data, // list of receivers
                subject: ''+user.username+'님께서 W3에 초대 하셨습니다!', // Subject line
                text: ''+presenturl, // plaintext body
                html: '<b>'+presenturl+'</b>' // html body
            };

            transporter.sendMail(mailOptions, function(error, info){
                if(error){
                    console.log(error);
                }else{
                    console.log('Message sent: ' + info.response);
                }
                if(!error)
                {
                    socket.emit('Sucessmail',data);
                }
            });
            console.log(data)

        })
    })
//---------------------------send mail.end------------------------------

    socket.on('createSlide', function(userID, isNewSlide){
        Users.findOne({'id':userID},function(err,user){
            if(err){
                console.err(err);
                throw err;
            }
            user.projectNum++;
            user.update();
            console.log('Create Slide')
            socket.emit('slideInfo', user, isNewSlide);
        })
    });
    socket.on('newSlides', function(pptURL, pptImg, pptName, user){
        console.log('New Slides')
        var newSlides = new PPTs({
            fileName : pptName,
            members : {
                name : user.username,
                profilePicture: user.profilePicture,
                email : user.email,
                id : user.id,
                isLogin: true
            },
            createdDate : Date.now(),
            thumbnail : pptImg,
            id : user.id+user.projectNum+pptName,
            url : pptURL,
            isNewSlide : 'new',
            objectNum:0
        });
        console.log(newSlides.id);
        newSlides.members.push({ name : user.username, profilePicture:user.profilePicture, email:user.email, id:user.id, isLogin:true})
        newSlides.save(function(err){ if(err) throw err; });
        Users.findOne({'id':user.id},function(err,user){
            user.projectList.push(newSlides);
            user.save(function(err,newUser){
                if(err) throw err;
            });
            app.get('/'+pptURL, ensureAuthenticated, function(req, res){
                res.render('slide', { pptURL:pptURL , uploadPPTData: 'notUploadPPT'});
            });
        });
    });

    socket.on('getSlideMembers', function(pptURL){
        PPTs.findOne({'url':pptURL}, function(err,ppt){
            if(err) throw err;
            socket.emit('slideMembers',ppt.members, ppt.isNewSlide)
        })
    });

    socket.on('saveUploadSlide', function(pptURL, jsonSlide, slideNum){
        PPTs.findOne({'url':pptURL}, function(err,ppt){
            if (err) throw err;
            ppt.pptContents.set(slideNum-1,jsonSlide);
            ppt.save();
        })
    })

    socket.on('saveSlide', function(pptURL, jsonSlide, slideNum){
        PPTs.findOne({'url':pptURL}, function(err,ppt){
            if (err) throw err;
            ppt.isNewSlide = 'old';
            ppt.pptContents.set(slideNum-1,jsonSlide);
            ppt.save();
        })
    })

    socket.on('delSlide',function(pptURL,slideNum){
        PPTs.findOne({'url':pptURL}, function(err,ppt){
            if (err) throw err;
            console.log('slideNum ' + slideNum)
            ppt.pptContents.set(slideNum-1,"");
            ppt.save();
        })
    })
    socket.on('getExistSlideSVG', function(pptURL){
        PPTs.findOne({'url':pptURL}, function(err,ppt){
            if(err) throw err;
            socket.emit('slideSVG',ppt.pptContents)
        })
    })

    socket.on('getUsersPPT',function(userID){
        // PPT members의 id 중 userID와 일치하는 members를 찾아서 뿌려주기.
        Users.findOne({'id':userID},function(err,user){
            PPTs.find({members :  {$elemMatch : {'id' : userID}}}, function(err,ppts){
                ppts.forEach(function (ppt) {
                    socket.emit('userPPT', ppt)
                })
            })
        });
    });
    socket.on('loadExistSlide',function(pptURL, userID){
        Users.findOne({'id':userID},function(err,user){
            if(err) throw err;
            app.get('/'+pptURL, ensureAuthenticated, function(req, res){
                res.render('slide', { pptURL:pptURL , uploadPPTData: 'notUploadPPT'});
            });
        })
    });

    socket.on('getAmountSlideNum',function(pptURL){
        PPTs.findOne({'url':pptURL}, function(err,ppt){
            if(err) throw err;
            socket.emit('amountSlideNum',ppt.pptContents.length)
        })
    });

    socket.on('addObject',function(pptURL, obj, slideNum, userID){
        PPTs.findOne({'url':pptURL}, function(err,ppt){
            ppt.objectNum++;
            ppt.save();
            socket.broadcast.to(pptURL).emit('addedObject',obj, slideNum, userID, ppt.objectNum);
        })


    })
    socket.on('addSlide' ,function(pptURL, slideNum, userID){
        socket.broadcast.to(pptURL).emit('addedSlide',slideNum, userID);
    })

    socket.on('getObjectNum', function(pptURL){
        PPTs.findOne({'url':pptURL}, function(err,ppt){
            socket.emit('objectNum', ppt.objectNum);
        })
    })
    socket.on('getObjectNumforEvent', function(pptURL){
        PPTs.findOne({'url':pptURL}, function(err,ppt){
            socket.emit('objectNumforEvent', ppt.objectNum);
        })
    })
    socket.on('slideClick', function(pptURL, slideNum, userID){
        Users.findOne({'id':userID},function(err,user){
            if(err) throw err;
            socket.broadcast.to(pptURL).emit('slideClicked',slideNum, userID, user.username);
        })
    })
    socket.on('isUploadPPT',function(pptURL){
        PPTs.findOne({'url':pptURL}, function(err,ppt){
            ppt.isNewSlide='old'
            ppt.save();
        })
    })
    socket.on('saveObjNum',function(pptURL,objectNum){
        PPTs.findOne({'url':pptURL}, function(err,ppt){
            ppt.objectNum = objectNum;ㅇ
            ppt.save();
        })
    })
    socket.on('slideStatus',function(pptURL, slideStatus){
        PPTs.findOne({'url':pptURL}, function(err,ppt){
            ppt.isNewSlide = slideStatus;
            ppt.save();
        })
    })
    socket.on('modifiedObject', function(userID, pptURL, objectID, newStyle){
        PPTs.findOne({'url':pptURL}, function(err,ppt){
            console.log('asdf')
            socket.broadcast.to(pptURL).emit('updateObject', userID, objectID, newStyle);
        })
    });

    socket.on('disconnect', function(){
        console.log("Socket Disconnected");
        io.sockets.emit('updateusers',socket.username);
        socket.leave(socket.room);
    });

});

/*
 *    서버가 켜지면 PPT Schema에 있는 pptURL들을 모두를 열
 */
PPTs.find({}, function(err, ppts) {
    ppts.forEach(function(ppt) {
        app.get('/'+ppt.url, ensureAuthenticated, function(req, res){
            res.render('slide', { pptURL:pptURL , uploadPPTData:tempSld});
        });
    });
});



