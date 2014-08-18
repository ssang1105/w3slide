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
        id : String
    }],
    createdDate : Date,
    pptContents : String,
    thumbnail : String,
    id : String,
    url : String
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
        profileFields: ['id', 'displayName', 'link', 'photos', 'emails']
    },
    function(accessToken, refreshToken, profile, done) {
        Users.findOne({id:profile.id}, function(err, oldUser){
            if(oldUser){
                done(null,oldUser);
            }else{
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

app.get('/auth/facebook', passport.authenticate('facebook'));
app.get('/auth/facebook/callback',
    passport.authenticate('facebook', {
        successRedirect: '/login_success',
        failureRedirect: '/login_fail',
        scope: ['email']
    })
);
app.get('/login_success', ensureAuthenticated, function(req, res, next){
    res.render('success_login', { profileImage : req.user.profilePicture, namespace:req.user.username, userID:req.user.id })
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

    socket.on('createSlide', function(userID){
        Users.findOne({'id':userID},function(err,user){
            if(err){
                console.err(err);
                throw err;
            }

            user.projectNum++;
            user.save();
            console.log('Create Slide')
            socket.emit('slideInfo', user);
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
                id : user.id
            },
            createdDate : Date.now(),
            pptContents : null,
            thumbnail : pptImg,
            id : user.id+user.projectNum+pptName,
            url : pptURL
        });
        newSlides.members.push({ name : user.username, profilePicture:user.profilePicture, email:user.email, id:user.id})
        newSlides.save(function(err,newSlides){
                if(err) throw err;
            });
        Users.findOne({'id':user.id},function(err,user){
            PPTs.findOne({'id':user.id+user.projectNum+pptName},function(err,ppt){
                if(err) throw err;
                console.log(ppt)
                user.projectList.push(ppt.id);
                user.save(function(err,newUser){
                    if(err) throw err;
                });
            });
            app.get('/'+pptURL, ensureAuthenticated, function(req, res){

                // 사용자 저장 (PPT  members내에 있는 지 중복check)
                // 사용자 뿌려주기 (DB의 해당 Schema의 members들을 전부 뿌려준다)
                // 사용자 로그인/로그오프는 d
                res.render('slide', { profileImage : user.profilePicture, namespace:user.username, userID:user.id });
            });
        });

    })

    socket.on('getUsersPPT',function(userID){
        Users.findOne({'id':userID},function(err,user){
            for(var i=0; i<user.projectList.length; i++){
                PPTs.findOne({'id':user.projectList[i]},function(err,ppt){
                    socket.emit('userPPT', ppt)
                });
            }
        });
    });
    socket.on('loadExistSlide',function(pptURL, userID){
        Users.findOne({'id':userID},function(err,user){
            if(err) throw err;
            app.get('/'+pptURL, ensureAuthenticated, function(req, res){
//                socket
                res.render('slide', { profileImage : user.profilePicture, namespace:user.username, userID:user.id });
            });
        })
    });

    socket.on('disconnect', function(){
        console.log("Socket Disconnected");
    })
});
