///<reference path="../typings/tsd" />
import * as http from 'http';
import * as express from 'express';
import * as socketIO from 'socket.io';
import { ConnectionController } from './game/ConnectionController';
// REST API imports:
import * as mongoDb from 'mongodb';
import * as path from 'path';
import * as bodyParser from 'body-parser';
import * as hash from 'password-hash';
import * as crypto from 'crypto';

// Creating Express and SocketIO server
var app = express();
var server = (<any>http).Server(app);
var io = socketIO(server);
var router = express.Router();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

var Db = mongoDb.Db;
var MongoServer = require('mongodb').Server;
var db = new Db('routerme', new MongoServer('localhost', 27017));

var port = 80;
server.listen(port);
console.log("Server is running on port: " + port);

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname + '/public/frame.html'));
});

app.use(express.static(__dirname + '/node_modules'));
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

io.on('connection', function (socket) {
});

// Instantiating services and controllers
let connectionCtrl = new ConnectionController(io);

class User {

    constructor(private username:string,
                private password:string,
                private email:string,
                private token:string) {
    }
}


router.post('/', function(req, res, next) {

    var username = req.body.username;
    var token = req.body.token;

    var criteria = {};
    criteria.username = username;

    if(users != undefined) {
        users.find(criteria).toArray(function (err, docs) {

            if (docs != null && docs.length != 0) {

                var user = getSingleResult(docs);
                if (user.token === token) {
                    res.sendFile(__dirname + '/public/index.html');
                }
                else {
                    res.sendFile(__dirname + '/public/login.html');
                }
            } else {
                res.sendFile(__dirname + '/public/login.html');
            }
        });
    } else {
        res.sendFile(__dirname + '/public/login.html');
    }
});

router.post('/login', function(req, res, next) {
    console.log('User logging request');

    var criteria = {};
    criteria.username = req.body.username;

    if(users != undefined) {
        users.find(criteria).toArray(function (err, docs) {

            if (docs != null && docs.length != 0) {

                var user = getSingleResult(docs);
                if (hash.verify(req.body.password, user.password)) {
                    var token = generate_key();

                    updateUserToken(user, token);

                    res.json({status: "success", message: "Logging in...", user: req.body.username, authtoken: token});
                }
                else {
                    res.json({status: "error", message: "Username and password don't match!", user: req.body.username});
                }
            } else {
                res.json({status: "error", message: "Username and password don't match!", user: req.body.username});
            }
        });
    } else {
        res.json({status: "error", message: "Database connection error!", user: req.body.username});
    }
});

router.post('/signedup', function(req, res, next) {
    console.log('Sign up!');

    var username = req.body.username;
    var email = req.body.email;
    var password = hash.generate(req.body.password);

    if(users != undefined) {
        users.findOne({username: username}, function (err, doc) {
            if (doc) {
                res.json({status: "error", user: username});
            } else {
                var user = new User(username, password, email, "");
                saveUser(user, res);
            }
        });
    } else {
        res.json({status: "error", message: "Database connection error!", user: req.body.username});
    }
});

router.get('/auth/:user/:token', function(req, res, next) {
    console.log('Token validation request for user: ' + req.params.user);

    var criteria = {};
    criteria.username = req.params.user;

    if(users != undefined) {
        users.find(criteria).toArray(function (err, docs) {

            if (docs != null && docs.length != 0) {

                var user = getSingleResult(docs);
                if (user.token === req.params.token) {

                    res.json({status: "success"});
                    console.log("Database: Token successfully validated");
                }
                else {
                    res.json({status: "error"});
                    console.log("Database: Token validation error: tokens don't match");
                }
            } else {
                res.json({status: "error"});
                console.log("Database: Token validation error: " + criteria.username + " can not be found in database!");
            }
        });
    } else {
        res.json({status: "error", message: "Database connection error!", user: req.body.username});
    }
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
    if(users != undefined) {
        users.updateOne({username: User.username}, {$set: {token: Token}}, function (err) {
            if (!err) {
                console.log("Database: User token successfully updated");
            } else {
                console.log("Database: Failed to update User token");
            }
        });
    } else console.log("MongoDb connection error!");
}

function getSingleResult(docs){
    return docs[0];
}

var generate_key = function() {
    var sha = crypto.createHash('sha256');
    sha.update(Math.random().toString());
    return sha.digest('hex');
}



