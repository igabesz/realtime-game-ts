///<reference path="../typings/tsd" />
import * as http from 'http';
import * as express from 'express';
import * as socketIO from 'socket.io';
import { StateService } from './game/StateService';
import { MoveController } from './game/MoveController';
import { TurnService } from './game/TurnService';


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
// Later you need to do this per parallel games
let stateSvc = new StateService();
let moveCtrl = new MoveController(stateSvc);
let turnSvc = new TurnService(stateSvc, (msg, data) => io.emit(msg, data));

io.on('connection', function (socket) {
  // TODO: Make a cleaner solution for this. E.g. create a ConnectionController
  socket.emit('state', stateSvc.state);
  // ConnectionController
  socket.on('move', (data) => moveCtrl.move(data));
});

// Starting server
server.listen(80);
// Starting TurnService
turnSvc.start(33);
