///<reference path="../typings/tsd" />
import * as http from 'http';
import * as express from 'express';
import * as socketIO from 'socket.io';
<<<<<<< HEAD
import * as mongoDb from 'mongodb';
import * as path from 'path';
import * as bodyParser from 'body-parser';
import * as hash from 'password-hash';
import * as crypto from 'crypto';
=======
>>>>>>> parent of d2b0533... basic inital server with rest

var app = express();
var server = (<any>http).Server(app);
var io = socketIO(server);

<<<<<<< HEAD
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

var Db = mongoDb.Db;
var MongoServer = require('mongodb').Server;
var db = new Db('spacegame', new MongoServer('localhost', 27017));

var port = 80;
server.listen(port);
console.log("Server is running on port: " + port);
=======
server.listen(80);
>>>>>>> parent of d2b0533... basic inital server with rest

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname + '/public/login.html'));
});

app.use(express.static('node_modules'));
<<<<<<< HEAD
app.use(express.static(__dirname + '/public'));
app.use('/', router);

var users;
db.open(function(err, db) {
    if(!err) {
        users = db.collection("users");
        console.log('Open: MongoDb connected!');
    } else {
        console.log('Open: MongoDb connection error!');
    }

});
=======
app.use(express.static('public'));
>>>>>>> parent of d2b0533... basic inital server with rest

let state = {
  player: {
    x: 0,
    y: 0,
  }
};

<<<<<<< HEAD
class User {

    constructor(
        private username: string,
        private password: string,
        private email: string,
        private token: string
    ) {}
=======
class MoveController {
  move(data: {direction: string }) {
    switch (data.direction) {
    case 'left':
      state.player.x--;
      break;
    case 'right':
      state.player.x++;
      break;
    }
  }
>>>>>>> parent of d2b0533... basic inital server with rest
}

io.on('connection', function (socket) {
  socket.emit('state', state);
});



setInterval(() => {
  io.emit('state', state);
}, 100);
<<<<<<< HEAD


router.get('/login', function(req, res, next) {
    console.log('Login request');
    res.sendFile(path.join(__dirname + '/public/login.html'));
});

router.post('/', function(req, res, next) {
    console.log('User logging request');

    var criteria = {};
    criteria.username = req.body.username;

    users.find(criteria).toArray(function(err, docs){

        if(docs != null && docs.length != 0){

            var user = getSingleResult(docs);
            if(hash.verify(req.body.password, user.password)){
                var token = generate_key();

                updateUserToken(user, token);

                res.json({status: "success", message: "Logging in...", user: req.body.username, authtoken: token});
            }
            else{
                res.json({status: "error", message: "Username and password don't match!", user: req.body.username});
            }
        }else{
            res.json({status: "error", message: "Username and password don't match!",user: req.body.username});
        }
    });

});

router.post('/signedup', function(req, res, next) {
    console.log('Sign up!');

    var username = req.body.username;
    var email = req.body.email;
    var password = hash.generate(req.body.password);

    users.findOne({username: username}, function(err, doc){
        if(doc){
            res.json({status: "error", user: username});
        }else{
            var user = new User(username, password, email, "");
            saveUser(user, res);
        }
    });
});

router.get('/session/:user/:token', function(req, res, next) {
    console.log('Token validation request for user: ' + req.params.user);

    var criteria = {};
    criteria.username = req.params.user;

    users.find(criteria).toArray(function(err, docs){

        if(docs != null && docs.length != 0){

            var user = getSingleResult(docs);
            if(user.token === req.params.token){

                res.sendFile(__dirname + '/public/index.html');
                console.log("Database: Token successfully validated");
            }
            else{
                res.json({status: "error"});
                console.log("Database: Token validation error: tokens don't match");
            }
        }else{
            res.json({status: "error"});
            console.log("Database: Token validation error: " + criteria.username + " can not be found in database!");
        }
    });
});

function saveUser(User, Response){
    if(!users) {
        console.log('MongoDb connection error!');
        return false;
    } else {
        users.insert(User, function (err, records) {
            if (!err) {
                console.log('Database: User saved to database!');
                Response.json({status: "success", user: User.username});
                return true;
            } else {
                Response.json({status: "error", user: User.username});
                console.log('Database: Save to database failed!');
                return false;
            }
        });
    }
}

function updateUserToken(User, Token){
    users.updateOne({username: User.username}, {$set: {token: Token}}, function(err){
        if(!err){
            console.log("Database: User token successfully updated");
        }else{
            console.log("Database: Failed to update User token");
        }
    });
}

function getSingleResult(docs){
    return docs[0];
}

var generate_key = function() {
    var sha = crypto.createHash('sha256');
    sha.update(Math.random().toString());
    return sha.digest('hex');
};
=======
>>>>>>> parent of d2b0533... basic inital server with rest
