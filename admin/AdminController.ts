import { Router, Request, Response }  from 'express';
import * as path from 'path';

import { Room } from '../common/Room';
import { AllChatMessage } from '../common/Message';

import { LifeCycleState } from '../game/LifeCycle';
import { Client, ConnectionController } from '../game/ConnectionController';

import { IDatabase, DatabaseResponse, Status } from '../database/Database';
import { User } from '../database/User';

import { UserData, RoomData } from './DataTypes';


export class AdminController {

    private exitEvent: Function = null;

    public constructor(private connectionController: ConnectionController, private router: Router, private database: IDatabase) {
        router.get('/admin/', (request: Request, response: Response, next) => { response.redirect('/admin/index.html'); });
        router.get('/admin/index.html', (request: Request, response: Response, next) => this.admin(request, response, next));
        router.get('/admin/logout', (request: Request, response: Response, next) => this.logout(request, response, next));
        
        router.get('/admin/db', (request: Request, response: Response, next) => this.db(request, response, next));
        router.get('/admin/users', (request: Request, response: Response, next) => this.users(request, response, next));
        router.get('/admin/rooms', (request: Request, response: Response, next) => this.rooms(request, response, next));
        
        router.post('/admin/stop', (request: Request, response: Response, next) => this.stop(request, response, next));
        router.post('/admin/allchat', (request: Request, response: Response, next) => this.allChat(request, response, next));
    }
    
    public setExit(func: Function): void {
        this.exitEvent = func;
    }
    
    private adminAuthorization(request: Request, response: Response, action: (request: Request, response: Response) => void): void {
        let token: string = request.header('Authorization');
        this.database.validateToken(token, (res: DatabaseResponse) => {
            if(res.status === Status.success) {
                let user: User = res.data;
                if(user.isAdmin) {
                    action(request, response);
                    return;
                }
            }
            response.status(401).send('Unauthorized');
        });
    }

    /* html request */

    private admin(request: Request, response: Response, next): void {
        // TO-DO add authorization to redirect
        /*this.adminAuthorization(request, response, (req: Request, res: Response) => {
            res.sendFile(path.join(__dirname + '/../public/admin/admin.html'));
        });*/
        response.sendFile(path.join(__dirname + '/../public/admin/admin.html'));
    } 
    
    private logout(request: Request, response: Response, next): void {
        let token: string = request.header('Authorization');
        // TO-DO delete token from db
        response.send('Logout');
    }
    
    /* data request */
    
    private db(request: Request, response: Response, next): void {
        this.adminAuthorization(request, response, (req: Request, res: Response) => {
            res.send(this.database.isConnected);
        });
    }
    
    private users(request: Request, response: Response, next): void {
        this.adminAuthorization(request, response, (req: Request, res: Response) => {
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
            res.send(users);
        });
    }
    
    private rooms(request: Request, response: Response, next): void {
        this.adminAuthorization(request, response, (req: Request, res: Response) => {
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
            res.send(roomDatas);
        });
    }
    
    /* commands */
    
    private stop(request: Request, response: Response, next): void {
        this.adminAuthorization(request, response, (req: Request, res: Response) => {
            this.connectionController.stopServer();
            res.send('Server closed');
            this.exitEvent();
        });
    }
    
    private allChat(request: Request, response: Response, next): void {
        this.adminAuthorization(request, response, (req: Request, res: Response) => {
            let message: AllChatMessage = new AllChatMessage();
            message.message = request.body;
            this.connectionController.sendToAll('admin', message);
            res.send('Sent');
        });
    }
}
