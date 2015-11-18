/**
 * Created by S on 2015.11.13..
 */
import { User } from './User';
import * as hash from 'password-hash';
import * as crypto from 'crypto';
import { Db }  from 'mongodb';


export interface IDatabase {

    isConnected: boolean;

    open(callback: (res:DatabaseResponse) => any) : void;

    close(callback: (res:DatabaseResponse) => any) : void;

    validateToken(token: string, callback: (res:DatabaseResponse) => any) : void;

    findUsers(username: string, callback: (res:DatabaseResponse) => any) : void;

    doesUserExist(username: string, callback: (res:DatabaseResponse) => any) : void;

    validateUserWithToken(username: string, token: string, callback: (res:DatabaseResponse) => any) : void;

    validateUserWithPassword(username: string, password: string, callback: (res:DatabaseResponse) => any) : void;

    saveUser(user: User, callback: (res:DatabaseResponse) => any) : void;

    updateUserToken(username: string, callback: (res:DatabaseResponse) => any) : void;

    cleanTokens(callback: (res:DatabaseResponse) => any) : void;
}

export enum Status {
    success,
    error
}

export class DatabaseResponse{

    constructor(public status: Status, public data: any, public msg: string){}
}

export class Database implements IDatabase {

    private users: any;

    public isConnected: boolean = false;

    constructor(private db: Db){
    }

    open(callback: (res:DatabaseResponse) => any){
        this.db.open((err, db) => {
            if(!err) {
                this.isConnected = true;
                this.users = db.collection("users");
                callback( new DatabaseResponse(Status.success, {} , "Successfully opened 'users'") );

                db.addListener('close', () => {
                    this.isConnected = false;
                })
                return;

            } else {
                callback( new DatabaseResponse(Status.error, {} , "Failed to open 'users'") );
                return;
            }

        });
    }

    close(callback: (res:DatabaseResponse) => any){
        this.db.close();
        callback( new DatabaseResponse(Status.success, {} , "Successfully closed database") );
    }

    validateToken(token:string,  callback: (res:DatabaseResponse) => any){

        let criteria = {token: token};

        if (this.users != undefined) {
            this.users.find(criteria).toArray((err, docs) => {

                if (docs != null && docs.length != 0) {

                    let user = docs[0];
                    callback( new DatabaseResponse(Status.success, user , "Token is valid") );
                    return;
                } else {
                    callback( new DatabaseResponse(Status.error, {} , "Token not found") );
                    return;
                }
            });
        } else {
            callback( new DatabaseResponse(Status.error, {} , "Error: 'users' is undefined") );
            return;
        }
    }

    findUsers(username:string, callback: (res:DatabaseResponse) => any){

        let criteria = {username: username};

        if (this.users != undefined) {
            this.users.find(criteria).toArray((err, docs) => {
                if (docs != null) {
                    callback( new DatabaseResponse(Status.success, docs , "Successfully queried 'users'") );
                    return;
                } else {
                    callback( new DatabaseResponse(Status.error, {} , "Failed to query 'users'") );
                    return;
                }
            });
        } else {
            callback( new DatabaseResponse(Status.error, {} , "Error: 'users' is undefined") );
            return;
        }
    }

    doesUserExist(username:string, callback: (res:DatabaseResponse) => any){

        let criteria = {username: username};

        if (this.users != undefined) {
            this.users.find(criteria).toArray((err, docs) => {
                if (docs != null && docs.length != 0) {
                    callback( new DatabaseResponse(Status.error, {} , "Username: " + username + " already exists") );
                    return;
                } else if(docs != null){
                    callback( new DatabaseResponse(Status.success, {} , "Username: " + username + " does not exist yet") );
                    return;
                } else {
                    callback( new DatabaseResponse(Status.error, {} , "Failed to query 'users'") );
                    return;
                }
            });
        } else {
            callback( new DatabaseResponse(Status.error, {} , "Error: 'users' is undefined") );
            return;
        }
    }

    validateUserWithToken(username:string, token:string,  callback: (res:DatabaseResponse) => any){

        let criteria = {username: username};

        if (this.users != undefined) {
            this.users.find(criteria).toArray( (err, docs) => {

                if (docs != null && docs.length != 0) {

                    let user = docs[0];
                    if (user.token === token) {
                        callback( new DatabaseResponse(Status.success, {} , "User " + username + " validated with token") );
                        return;
                    }
                    else {
                        callback( new DatabaseResponse(Status.error, {} , "Wrong token for user: " + username) );
                        return;
                    }
                } else {
                    callback( new DatabaseResponse(Status.error, {} , "No user is found to be validated") );
                    return;
                }
            });
        } else {
            callback( new DatabaseResponse(Status.error, {} , "Error: 'users' is undefined") );
            return;
        }
    }

    validateUserWithPassword(username:string, password:string, callback: (res:DatabaseResponse) => any){

        let criteria = {username: username};

        if (this.users != undefined) {
            this.users.find(criteria).toArray((err, docs) => {

                if (docs != null && docs.length != 0) {

                    let user = docs[0];
                    if (hash.verify(password, user.password)) {

                        this.updateUserToken(user.username, callback);
                        return;
                    }
                    else {
                        console.log("Wrong password, given!");
                        callback( new DatabaseResponse(Status.error, {} , "Wrong password for user: " + username) );
                        return;
                    }
                } else {
                    callback( new DatabaseResponse(Status.error, {} , "No user is found to be validated") );
                    return;
                }
            });
        } else {
            callback( new DatabaseResponse(Status.error, {} , "Error: 'users' is undefined") );
            return;
        }
    }

    saveUser(user:User, callback: (res:DatabaseResponse) => any){

        if (this.users != undefined) {
            this.users.insert(user, (err, docs) => {
                if (!err) {
                    callback( new DatabaseResponse(Status.success, {} , "User: " + user.username + " saved successfully") );
                    return;
                } else {
                    callback( new DatabaseResponse(Status.error, {} , "Could not save user: " + user.username) );
                    return;
                }
            });
        } else {
            callback( new DatabaseResponse(Status.error, {} , "Error: 'users' is undefined") );
            return;
        }
    }

    updateUserToken(username:string, callback: (res:DatabaseResponse) => any){

        let token = this.generate_key();

        if (this.users != undefined) {
            this.users.updateOne({username: username}, {$set: {token: token}}, (err) => {
                if (!err) {
                    callback( new DatabaseResponse(Status.success, {token:token} , "User: " + username + "'s token successfully updated") );
                    return;
                } else {
                    callback( new DatabaseResponse(Status.error, {} , "Could not update the token of user: " + username) );
                    return;
                }
            });
        } else {
            callback( new DatabaseResponse(Status.error, {} , "Error: 'users' is undefined") );
            return;
        }
    }

    cleanTokens(callback: (res:DatabaseResponse) => any){
        if (this.users != undefined) {
            this.users.update({}, {$set: {token: ""}}, (err) => {
                if (!err) {
                    callback( new DatabaseResponse(Status.success, {} , "Token cleaning is successfully done") );
                    return;
                } else {
                    callback( new DatabaseResponse(Status.error, {} , "Failed to clean tokens") );
                    return;
                }
            });
        } else {
            callback( new DatabaseResponse(Status.error, {} , "Error: 'users' is undefined") );
            return;
        }
    }

    generate_key () {
        var sha = crypto.createHash('sha256');
        sha.update(Math.random().toString());
        return sha.digest('hex');
    }

}