/**
 * Created by S on 2015.11.09..
 */
import { User } from './User';

export var Login = function (router, db, path, hash, crypto) {

    let users: any;
    db.open(function(err, db) {
        if(!err) {
            users = db.collection("users");
            console.log('Open: MongoDb connected!');
        } else {
            console.log('Open: MongoDb connection error!');
        }

    });

    router.post('/', function (req, res, next) {

        var username = req.body.username;
        var token = req.body.token;

        console.log("/ -> " + username + " " + token);

        if( username === undefined || token === undefined || username === "" || token === "")
                res.sendFile(path.resolve(__dirname + '/../public/login.html'));

        var criteria: any = {};
        criteria.username = username;

        if (users != undefined) {
            users.find(criteria).toArray(function (err, docs) {

                if (docs != null && docs.length != 0) {

                    var user = getSingleResult(docs);
                    if (user.token === token) {

                        var index = path.resolve(__dirname + '/../public/index.html');
                        res.sendFile(path.resolve(__dirname + '/../public/index.html'));
                        console.log("ok, sent: " + index );
                    }
                    else {
                        res.sendFile(path.resolve(__dirname + '/../public/login.html'));

                    }
                } else {
                    res.sendFile(path.resolve(__dirname + '/../public/login.html'));

                }
            });
        } else {
            res.sendFile(path.resolve(__dirname + '/../public/login.html'));

        }
    });

    router.post('/login', function (req, res, next) {
        console.log('User logging request');

        let criteria: any = {};
        criteria.username = req.body.username;



        if (users != undefined) {
            users.find(criteria).toArray(function (err, docs) {

                if (docs != null && docs.length != 0) {

                    var user = getSingleResult(docs);
                    if (hash.verify(req.body.password, user.password)) {
                        var token = generate_key();

                        updateUserToken(user, token);

                        res.json({
                            status: "success",
                            message: "Logging in...",
                            user: req.body.username,
                            authtoken: token
                        });
                    }
                    else {
                        res.json({
                            status: "error",
                            message: "Username and password don't match!",
                            user: req.body.username
                        });
                    }
                } else {
                    res.json({status: "error", message: "Username and password don't match!", user: req.body.username});
                }
            });
        } else {
            res.json({status: "error", message: "Database connection error!", user: req.body.username});
        }
    });

    router.post('/signedup', function (req, res, next) {
        console.log('Sign up!');

        var username = req.body.username;
        var email = req.body.email;
        var password = hash.generate(req.body.password);

        if (users != undefined) {
            users.findOne({username: username}, function (err, doc) {
                if (doc) {
                    res.json({status: "error", user: username});
                } else {
                    var user:User = new User(username, password, email, "");
                    saveUser(user, res);
                }
            });
        } else {
            res.json({status: "error", message: "Database connection error!", user: req.body.username});
        }
    });

    router.get('/auth/:user/:token', function (req, res, next) {
        console.log('Token validation request for user: ' + req.params.user);

        let criteria: any = {};
        criteria.username = req.params.user;

        if (users != undefined) {
            users.find(criteria).toArray(function (err, docs) {

                if (docs != null && docs.length != 0) {

                    var user = getSingleResult(docs);
                    if (user.token === req.params.token) {

                        res.json({status: "success"});
                        console.log("Database: Token successfully validated");
                    }
                    else {
                        res.json({status: "error"});
                        console.log("Database: Token validation error: tokens don't match");
                    }
                } else {
                    res.json({status: "error"});
                    console.log("Database: Token validation error: " + criteria.username + " can not be found in database!");
                }
            });
        } else {
            res.json({status: "error", message: "Database connection error!", user: req.body.username});
        }
    });


    function saveUser(User, Response) {
        if (!users) {
            console.log('MongoDb connection error!');
            return false;
        } else {
            users.insert(User, function (err, records) {
                if (!err) {
                    console.log('Database: User saved to database!');
                    Response.json({status: "success", user: User.username});
                    return true;
                } else {
                    Response.json({status: "error", user: User.username});
                    console.log('Database: Save to database failed!');
                    return false;
                }
            });
        }
    }

    function updateUserToken(User, Token) {
        if (users != undefined) {
            users.updateOne({username: User.username}, {$set: {token: Token}}, function (err) {
                if (!err) {
                    console.log("Database: User token successfully updated");
                } else {
                    console.log("Database: Failed to update User token");
                }
            });
        } else console.log("MongoDb connection error!");
    }

    function getSingleResult(docs){
        return docs[0];
    }

    var generate_key = function() {
        var sha = crypto.createHash('sha256');
        sha.update(Math.random().toString());
        return sha.digest('hex');
    }
}



