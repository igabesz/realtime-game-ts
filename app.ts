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

import { ConnectionController } from './game/ConnectionController';
import { AdminController } from './AdminController';

// Creating Express and SocketIO server
let app: express.Express = express();
let server: http.Server = (<any>http).Server(app);
let io: SocketIO.Server = socketIO(server);
let router: express.Router = express.Router();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

var Db = mongoDb.Db;
var MongoServer = require('mongodb').Server;
var db = new Db('routerme', new MongoServer('localhost', 27017));

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
app.use(express.static('public'));

// Instantiating services and controllers
let connectionController: ConnectionController = new ConnectionController(io);
let adminController: AdminController = new AdminController(connectionController, router);
adminController.setExit(function(): void {
    server.close();
    db.close();
    console.log('Server stopped by an admin');
    process.exit(0);
});

// Starting server
server.listen(80);
app.use(express.static(__dirname + '/public'));
app.use('/', router);

var users;
db.open(function(err, db) {
    if(!err) {
        users = db.collection("users");
        adminController.DBConnected = true;
        console.log('Open: MongoDb connected!');
    } else {
        console.log('Open: MongoDb connection error!');
    }

});



let port:number = 80;
server.listen(port);

console.log("Server started on http://localhost:" + port + "/");
