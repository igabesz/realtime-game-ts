///<reference path="../typings/tsd" />
import * as http from 'http';
import * as express from 'express';
import * as socketIO from 'socket.io';

var app = express();
var server = (<any>http).Server(app);
var io = socketIO(server);

server.listen(80);

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/public/index.html');
});

app.use(express.static('node_modules'));
app.use(express.static('public'));

let state = {
  player: {
    x: 0,
    y: 0,
  }
};

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
