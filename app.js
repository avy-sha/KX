var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mysql = require('mysql');
var moment = require('moment');
var fs = require('fs');
var aws = require('aws-sdk');
var multer = require('multer');
var multerS3 = require('multer-s3');
var config = require("./config");
var jwt = require("./services/jwt");

var app = express();
var accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), {flags: 'a'});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(morgan('combined', {stream: accessLogStream}));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', 'http://kisanx.c.api-central.net:8080');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});


var con = mysql.createConnection({
    host: config.db.host,
    user: config.db.user,
    password: config.db.password,
    database: config.db.database
});

con.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
});

/*app.use('/', index);
app.use('/users', users);*/

/*app.use('/', index);
*/

app.post("/login",function(req,res){
    var userid = req.body.userid;
    var password = req.body.password;
    var session;
    con.query("SELECT * from login where userid=? AND password=?",[userid,password],function (error, results, fields){
       if(error) throw err;
       else{
           if(results.length!=1){
               return res.status(401).json({"error":"user details incorrect"});
           }
           else{
               return res.status(200).json({"sessionjwt":jwt.issue(userid),"message":"Success"});
           }
       }
   })
});

app.post("/new/user",function(req,res){
var userid = req.body.userid;
var password = req.body.password;
    if(userid==undefined)return res.status(400).json({error:"Userid required"});
   con.query("SELECT userid FROM login where userid=?",[userid],function (error, results, fields){
        if(error) throw err;
        else{
            if(results.length==0){
                con.query("INSERT INTO login values(?,?)",[userid,password],function (error, results, fields){
                    if(error) throw err;
                    else{
                       return res.status(200).json({"userid":userid,"message":userid +"successfully created"});
                    }
                })
            }
            else{
           return res.status(200).json({"error":"already created"});}
        }
    })
});

app.post("/new/registration",function(req,res){
    var userid = req.body.userid;
    var password = req.body.password;
    if(userid==undefined)return res.status(400).json({error:"Userid required"});
    con.query("SELECT userid FROM login where userid=?",[userid],function (error, results, fields){
        if(error) throw err;
        else{
            if(results.length==0){
                con.query("INSERT INTO login values(?,?)",[userid,password],function (error, results, fields){
                    if(error) throw err;
                    else{
                        return res.status(200).json({"userid":userid,"message":userid +"successfully created"});
                    }
                })
            }
            else{
                return res.status(200).json({"error":"already created"});}
        }
    })
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});
app.listen(80, () => console.log('Example app listening on port 80!'));

module.exports = app;
