/**
 * Created by S on 2015.11.13..
 */
import { User } from '../login/User';
import * as hash from 'password-hash';
import * as crypto from 'crypto';

interface IDatabase {

    open(callback: (res:DatabaseResponse) => any) : void;

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

    status: Status;
    data: any;
    msg: string;

    constructor(status: Status, data: any, msg: string){
        this.status = status;
        this.data = data;
        this.msg = msg;
    }
}

export class Database implements IDatabase {

    private static db: any;
    private static users: any;

    constructor(db){
        Database.db = db;
        this.open((dbres:DatabaseResponse) => {
            if(dbres.status == Status.success) {
                console.log("Successfully connected to MongoDB!")
                console.log(dbres.msg);
            }
            else console.info("ERROR: ", dbres.msg);
        })
    }

    open(callback: (res:DatabaseResponse) => any){
        Database.db.open(function(err, db) {
            if(!err) {
                Database.users = db.collection("users");
                callback( new DatabaseResponse(Status.success, {} , "Successfully opened 'users'") );
                return;

            } else {
                callback( new DatabaseResponse(Status.error, {} , "Failed to open 'users'") );
                return;
            }

        });
    }

    findUsers(username:string, callback: (res:DatabaseResponse) => any){

        let criteria = {username: username};

        if (Database.users != undefined) {
            Database.users.find(criteria).toArray(function (err, docs) {
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

        if (Database.users != undefined) {
            Database.users.find(criteria).toArray(function (err, docs) {
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

        if (Database.users != undefined) {
            Database.users.find(criteria).toArray(function (err, docs) {

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

        if (Database.users != undefined) {
            Database.users.find(criteria).toArray((err, docs) => {

                if (docs != null && docs.length != 0) {

                    let user = docs[0];
                    if (hash.verify(password, user.password)) {

                        this.updateUserToken(user.username, callback);
                        return;
                    }
                    else {
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

        if (Database.users != undefined) {
            Database.users.insert(user, function (err, docs) {
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

        if (Database.users != undefined) {
            Database.users.updateOne({username: username}, {$set: {token: token}}, function (err) {
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
        if (Database.users != undefined) {
            Database.users.update({}, {$set: {token: ""}}, function (err) {
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