import { Router, Request, Response }  from 'express';
import * as path from 'path';

import { Room } from '../common/Room';
import { AllChatMessage } from '../common/Message';

import { LifeCycleState } from '../game/LifeCycle';
import { Client, ConnectionController } from '../game/ConnectionController';

import { UserData, RoomData } from './DataTypes';


export class AdminController {

    private exitEvent: Function = null;
    public DBConnected: boolean = false;

    public constructor(private connectionController: ConnectionController, private router: Router) {
        router.get('/admin/index.html', (request: Request, response: Response, next) => this.admin(request, response, next));
        router.get('/admin/db', (request: Request, response: Response, next) => this.db(request, response, next));
        router.get('/admin/users', (request: Request, response: Response, next) => this.users(request, response, next));
        router.get('/admin/rooms', (request: Request, response: Response, next) => this.rooms(request, response, next));
        
        router.post('/admin/stop', (request: Request, response: Response, next) => this.stop(request, response, next));
        router.post('/admin/allchat', (request: Request, response: Response, next) => this.allChat(request, response, next));
    }
    
    public setExit(func: Function): void {
        this.exitEvent = func;
    }

    private admin(request: Request, response: Response, next): void {
        response.sendFile(path.join(__dirname + '/../public/admin/admin.html'));
    } 
    
    private stop(request: Request, response: Response, next): void {
        this.connectionController.stopServer();
        response.send('Server closed');
        this.exitEvent();
    }
    
    private allChat(request: Request, response: Response, next): void {
        let message: AllChatMessage = new AllChatMessage();
        message.message = request.body;
        this.connectionController.sendToAll('admin', message);
        response.send('Sent');
    }
    
    private db(request: Request, response: Response, next): void {
        response.send(this.DBConnected);
    }
    
    private users(request: Request, response: Response, next): void {
        let clients: Array<Client> = this.connectionController.getClients();
        let users: Array<UserData> = []; 
        for(let i: number = 0; i < clients.length; i++) {
            let client: Client = clients[i];
            let user: UserData = new UserData();
            
            user.playerName = (client.player === undefined || client.player.name === undefined) ? '' : client.player.name;
            user.room = (client.isInRoom()) ? client.player.room.id : '';
            user.state = LifeCycleState[client.lifeCycle.State];
            
            users.push(user);
        }
        response.send(users);
    }
    
    private rooms(request: Request, response: Response, next): void {
        let rooms: Array<Room> = this.connectionController.getRooms();
        let roomDatas: Array<RoomData> = []; 
        for(let i: number = 0; i < rooms.length; i++) {
            let room: Room = rooms[i];
            let roomData: RoomData = new RoomData();
            
            roomData.name = room.id;
            roomData.host = room.host.name;
            roomData.numOfPlayers = room.players.length;
            
            roomDatas.push(roomData);
        }
        response.send(roomDatas);
    }
}
