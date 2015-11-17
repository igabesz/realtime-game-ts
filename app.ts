///<reference path="../typings/tsd" />
import * as http from 'http';
import * as express from 'express';
import * as socketIO from 'socket.io';
import * as mongoDb from 'mongodb';
import * as path from 'path';
import * as bodyParser from 'body-parser';

import { ConnectionController } from './game/ConnectionController';
import { AdminController } from './admin/AdminController';
import { Login } from './login/login';
import { Database } from './common/Database';

// Creating Express and SocketIO server
let app: express.Express = express();
let server: http.Server = (<any>http).Server(app);
let io: SocketIO.Server = socketIO(server);
let router: express.Router = express.Router();

let MongoServer = mongoDb.Server;
let db: mongoDb.Db = new mongoDb.Db('routerme', new MongoServer('localhost', 27017));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname + '/public/login.html'));
});
app.use(express.static(__dirname + '/node_modules'));
app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/common'));
app.use('/', router);

router.get('/common/:file', function (req, res, next) {
    var file = req.params.file;
    res.sendFile(path.resolve(__dirname + '/common/' + file));
});

// Instantiating login services
let database = new Database(db);
let login = new Login(router, database);
login.listen();

// Instantiating services and controllers
let connectionController: ConnectionController = new ConnectionController(io);
let adminController: AdminController = new AdminController(connectionController, router);
adminController.setExit(function(): void {
    server.close();
    db.close();
    console.log('Server stopped by an admin');
    process.exit(0);
});

db.open(function(err, db) {
    if(!err) {
        adminController.DBConnected = true;
    }
});

let port:number = 80;
server.listen(port, () => console.log("Server started on http://localhost:" + port + "/"));
