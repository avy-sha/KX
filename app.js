var express = require('express');
var path = require('path');
var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mysql = require('mysql');
var fs = require('fs');
var config = require("./config");
var jwt = require("./services/jwt")

var app = express();
var accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), {flags: 'a'});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.set('port', (process.env.PORT || 4000));
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

/*var s3 = new aws.S3({ accessKeyId:config.s3.accessKeyId , secretAccessKey:config.s3.secretAccessKey, region:config.s3.region });

var upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: 'kisanx',
        acl: 'public-read',
        contentType: function(req, file, cb){
            cb(null, file.mimetype);
        },
        key: function (req, file, cb) {
            console.log(file);
            cb(null, "app-uploads/" + Date.now().toString() + "-" + file.originalname)
        }
    })
});*/


/*app.post('/upload', upload.array('photos', 3), function(req, res, next) {
    res.send('Successfully uploaded ' + req.files.length + ' files!')
})*/

/*app.post('/upload', upload.array('image', 2), function(req, res, next) {
    try{var links=[];
        for(var i = 0 ;i< req.files.length;i++)links.push(req.files[i]['location']);
        res.status(200).json({
            "status":"200",
            "url":links
        });
    }catch(e){
        console.log("catch e wala part");
        res.status(500).json({
            "status":"500",
            "message":e
        });
    }
});*/


/*app.use('/', index);
app.use('/users', users);*/

/*app.use('/', index);
*/

/*app.post("/login",function(req,res){
    var userid = req.body.userid;
    var password = req.body.password;
    var session;
    con.query("SELECT * from login where userid=? AND password=?",[userid,password],function (error, results, fields){
       if(error) throw error;
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
                var reg_done=0;
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
    var Gender = req.body.Gender;
    var Name = req.body.Name;
    var Qualification = req.body.Qualification;
    var DOB = req.body.DOB; //DATE - format YYYY-MM-DD
    var Age = calculate_age(parseInt(DOB.split("-")[1]),parseInt(DOB.split("-")[2]),parseInt(DOB.split("-")[0]));
    var Religion = req.body.Religion;
    var State = req.body.State;
    var District = req.body.District;
    var Taluka = req.body.Taluka;
    var Village = req.body.Village;
    var Height = req.body.Height;
    var Build = req.body.Build;
    var userid= req.body.userid;
    var Profile_Pic="https://s3.ap-south-1.amazonaws.com/kisanx/app-uploads/Default_profile_women.jpg";
    var Longitude=1;
    var Latitude=1;
    var Timeofbirth="00:00:00";

    if(Gender=="male"||Gender=="Male"||Gender=="MALE"){

        var Total_Land =req.body.Total_Land ;
        var Yearly_Income = req.body.Yearly_Income;
        //var 7/12_coordinates;
    }
    else if(Gender=="female"||Gender=="Female"||Gender=="FEMALE"){
        con.query("INSERT INTO profile_female values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",[userid,Name,Qualification,DOB,Age,Religion,State,District,Taluka,Village,Timeofbirth,Height,Build,Longitude,Latitude,Profile_Pic],function (error, results, fields){
            if(error) {console.log(error);return res.status(400).json({"error":error});}
            else{
                return res.status(200).json({"results":results,"fields":fields});
            }
        })
    }
});

app.post("/get/profile",function(req,res){
   var userid = req.body.userid;
   if(!userid)return res.status(400).json({"error":"Userid required"});
    con.query("SELECT * from profile_female where userid = ?",[userid],function (error, results, fields){
        if(error) {console.log(error);return res.status(400).json({"error":error});}
        else{
            if(results.length==0)return res.status(200).json({"error":"no user with that id"});
            return res.status(200).json(results);
        }
    });
});

app.post("/matches/female",function(req,res){
    var lastid=req.body.lastid||"";
    if(lastid=="")lastid=0;
    con.query("SELECT * from profile_female where userid > ? ORDER BY userid ASC LIMIT 10",[lastid],function (error, results, fields){
        if(error) {console.log(error);return res.status(400).json({"error":error});}
        else{
                return res.status(200).json(results);
            }
    });
});*/
//get list of all the airports
app.get("/airports/getall",function (req,res) {
        con.query("SELECT * from Airport_Details",function (error, results, fields){
            if(error) {console.log(error);return res.status(400).json({"error":error});}
            else{
                return res.status(200).json(results);
            }
        });
}
);

//get list of all the devices installed at the airport
app.post("/devices/getall",function(req,res){
    var Airport_id = req.body.Airport_id;
    if(!Airport_id)return res.status(400).json({"error":"Airport_id required"});
    con.query("SELECT * from Devices where Airport_id = ? and Node_id IS NOT NULL",[Airport_id],function (error, results, fields){
        if(error) {console.log(error);return res.status(400).json({"error":error});}
        else{
            return res.status(200).json(results);
        }
    });
});

//post the route in the table routes
app.post("/routes/saveroute",function(req,res){
    var Airport_id = req.body.Airport_id;
    var Route = req.body.Route;

    if(!Airport_id || !Route )return res.status(400).json({"error":"Airport_id or Route missing !! "});
    con.query("SELECT count(*) from Routes where Airport_id = ? ",[Airport_id],function (error, results, fields){
        if(error) {console.log("Cannot retrieve count of routes for an airport "+ error);return res.status(400).json({"error":error});}
        else{
            var Route_id = Airport_id+"_"+results[0]['count(*)'];
            con.query("INSERT INTO Routes values(?,?,?)",[Route_id,Airport_id,Route],function (error, results, fields){
                if(error) throw err;
                else{
                    return res.status(200).json({"Message":"Route successfully created"});
                }
            });
        }
    });
});

//Delete all entries for a particular airport from routes testing purpose only
app.post("/routes/deleteall",function(req,res){
    var Airport_id = req.body.Airport_id;
    con.query("Delete from Routes where Route_id like ?; ",[Airport_id+'%'],function (error, results, fields){
        if(error) {console.log(error);return res.status(400).json({"error":error});}
        else{
            return res.status(200).json({"message":"Delete Successful"});
        }
    });
});
// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});
app.listen(app.get('port'), function () {
    console.log('Server has started! http://localhost:' + app.get('port') + '/');
});

module.exports = app;