///<reference path="../typings/tsd" />
import * as http from 'http';
import * as express from 'express';
import * as socketIO from 'socket.io';
import { ConnectionController } from './game/ConnectionController';

// Creating Express and SocketIO server
var app = express();
var server = (<any>http).Server(app);
var io = socketIO(server);

// Serving main HTML file
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/public/index.html');
});

// Serving Assets and public files
app.use(express.static('node_modules'));
app.use(express.static('public'));

// Instantiating services and controllers
let connectionCtrl = new ConnectionController(io);

// Starting server
let port:number = 80;
server.listen(port);

console.log("Server started on http://localhost:" + port + "/");
