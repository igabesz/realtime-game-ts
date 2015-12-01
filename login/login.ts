/**
 * Created by S on 2015.11.09..
 */
import { User } from '../database/User';
import { IDatabase, DatabaseResponse, Status } from '../database/Database';
// REST API imports:
import * as path from 'path';
import * as bodyParser from 'body-parser';
import * as hash from 'password-hash';
import * as crypto from 'crypto';
import { Router }  from 'express';

export class Login {

    private adminLogin: string;
    private adminPassword: string;

    constructor(private router: Router, private database:IDatabase) {
        this.database = database;
        this.router = router;

        this.adminLogin = "admin";
        this.adminPassword = "admin";

        this.database.open((dbres:DatabaseResponse) => {
            if(dbres.status == Status.success) {
                console.log("Successfully connected to MongoDB!")
                console.log(dbres.msg);

                this.database.cleanTokens(() => {});

                let pass = hash.generate(this.adminPassword);
                var user:User = new User(this.adminLogin, pass, "", "", true);

                this.database.doesUserExist("admin", (dbres:DatabaseResponse) => {
                    if(dbres.status === Status.success){
                        this.database.saveUser(user, (dbres: DatabaseResponse) => {});
                    }
                })
            }
            else console.info("ERROR: ", dbres.msg);
        })

    }

    listen(){

        this.router.get('/', (req, res, next) => {

            let token: string = req.header('Authorization');
            if(token === "" || token === undefined || token === null) {
                res.status(401).send("error");
                return;
            }

            this.database.validateToken(token, (dbres:DatabaseResponse) => {
                if (dbres.status === Status.success) {
                    res.status(200).send("ok");
                    //res.sendFile(path.resolve(__dirname + '/../public/index.html'));
                } else {
                    res.status(401).send("error");
                    //res.sendFile(path.resolve(__dirname + '/login.html'));
                    console.info("ERROR: ", dbres.msg);
                }
            });
        });

        this.router.post('/login', (req, res, next) => {
            console.log('User logging request');

            let username = req.body.username;
            let password = req.body.password;

            this.database.validateUserWithPassword(username, password, (dbres:DatabaseResponse) => {

                if(dbres.status === Status.success){
                    res.json({
                        status: "success",
                        message: "Logging in...",
                        user: username,
                        authtoken: dbres.data.token
                    });
                } else {
                    res.json({
                        status: "error",
                        message: "Username and password don't match!",
                        user: username
                    });
                    console.log("ERROR: ", dbres.msg);
                }
            });

        });

        this.router.post('/signedup', (req, res, next) => {
            console.log('Sign up');

            let username = req.body.username;
            let email = req.body.email;
            let password = hash.generate(req.body.password);

            if(username === this.adminLogin && password === this.adminPassword){
                res.json({status: "success", user: "admin"});
                return;
            }

            this.database.doesUserExist(username, (dbres:DatabaseResponse) => {

                if(dbres.status === Status.success){

                    var user:User = new User(username, password, email, "", false);

                    this.database.saveUser(user, (dbres: DatabaseResponse) => {
                        if(dbres.status === Status.success){
                            res.json({status: "success", user: username});
                        } else {
                            res.json({status: "error", user: username});
                            console.log("ERROR: ", dbres.msg);
                        }
                    });
                } else {
                    res.json({status: "error", user: username});
                    console.log("ERROR: ", dbres.msg);
                }
            });
        });

        this.router.get('/auth/:user/:token', (req, res, next) => {

            let username = req.params.user;
            let token = req.params.token;

            console.log('Token validation request for user: ' + username);

            this.database.validateUserWithToken(username, token, (dbres:DatabaseResponse) => {

                if(dbres.status === Status.success){
                    res.json({status: "success"});
                    console.log("Token successfully validated for user: " + username);
                } else {
                    res.json({status: "error"});
                    console.log("ERROR: ", dbres.msg);
                }
            });
        });
    }

}



