///<reference path="../typings/tsd" />
import * as http from 'http';
import * as express from 'express';
import * as socketIO from 'socket.io';
import { ConnectionController } from './game/ConnectionController';
import { Login } from './login/login';
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
    res.sendFile(path.join(__dirname + '/public/login.html'));
});

app.use(express.static(__dirname + '/node_modules'));
app.use(express.static(__dirname + '/public'));
app.use('/', router);

io.on('connection', function (socket) {
});

// Instantiating services and controllers
let connectionCtrl = new ConnectionController(io);

// Instantiating login services
let login = new Login(router, db, path, hash, crypto);

