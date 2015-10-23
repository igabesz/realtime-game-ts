///<reference path="../typings/tsd" />
import * as http from 'http';
import * as express from 'express';
import * as socketIO from 'socket.io';
import * as mongoDb from 'mongodb';
import * as path from 'path';

var router = express.Router();
var app = express();
var server = (<any>http).Server(app);
var io = socketIO(server);

var Db = mongoDb.Db;
var MongoServer = require('mongodb').Server;
var db = new Db('spacegame', new MongoServer('localhost', 27017));

server.listen(80);

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/public/index.html');
});

app.use(express.static('node_modules'));
app.use(express.static(__dirname + '/public'));
app.use('/', router);

var users;
db.open(function(err, db) {
    if(!err) {
        users = db.collection("users");
        console.log('MongoDb connected!');
    } else {
        console.log('MongoDb connection error!');
    }

});

let state = {
  player: {
    x: 0,
    y: 0
  }
};

class User {
    username: string;
    fullname: string;
    password: string;
    token: string;
    save(){
        if(!users) {
            console.log('MongoDb connection error!');
        } else {
            users.save({username: this.username}, {$set: this}, function (err) {
                if (!err) {
                    console.log('User saved to database!');
                } else {
                    console.log('Save to database failed!');
                }
            });
        }
    }
}

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
}

let moveCtrl = new MoveController();
io.on('connection', function (socket) {
  socket.emit('state', state);
  socket.on('move', (data) => moveCtrl.move(data));
});



setInterval(() => {
  io.emit('state', state);
}, 100);

router.get('/registration', function(req, res, next) {
    console.log('Registration request');
    res.sendFile(path.join(__dirname + '/public/registration.html'));
});

router.get('/login', function(req, res, next) {
    console.log('Login request');
    res.sendFile(path.join(__dirname + '/public/login.html'));
});

router.post('/login', function(req, res, next) {
    console.log('User logged');
    //login check
    if(true){
        res.sendFile(path.join(__dirname + '/public/spacegame.html'));
    }
});

