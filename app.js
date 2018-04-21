const express = require('express');

const mongoose = require('mongoose');
// const validate = require('validate.js');
const passport = require('passport');
const shuffle = require('shuffle-array');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

require('./db');
const Quest = mongoose.model('Quest');
const Game = mongoose.model('Game');
const User = mongoose.model('User');
const Character = mongoose.model('Character');

const session = require('express-session');
const path = require('path');

const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);

app.set('view engine', 'hbs');

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: false }));
app.use(session({
    secret: 'add session secret here!',
    resave: false,
    saveUninitialized: true,
}));
app.use(passport.initialize());
app.use(passport.session());
// add req.session.user to every context object for templates
app.use((req, res, next) => {
    res.locals.user = req.user;
    next();
});
passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (user, done) {
    done(null, user);
});

// Use the GoogleStrategy within Passport.
//   Strategies in Passport require a `verify` function, which accept
//   credentials (in this case, an accessToken, refreshToken, and Google
//   profile), and invoke a callback with a user object.
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.CALLBACK_URL
},
    function (accessToken, refreshToken, profile, done) {
        // User.findOrCreate({ googleId: profile.id }, function (err, user) {
        //     return done(err, user);
        // });

        User.findOne({ googleID: profile.id }, function (err, user) {
            if (!user) {
                // make a new google profile without key start with $
                // const newProfile = {};
                // newProfile.id = profile.id;
                // newProfile.displayName = profile.displayName;
                // newProfile.emails = profile.emails;
                user = new User({
                    name: profile.displayName,
                    googleID: profile.id,
                    // email: profile.emails[0],
                    provider: 'google'
                    // google: newProfile/* ._json */
                });
                user.save(function (err, savedUser) {
                    if (err) {
                        console.log(err);
                    }
                    console.log(savedUser);

                    return done(err, user);
                });
            } else {
                return done(err, user);
            }
        });

        // User.findOne({
        //     googleId: profile.id
        // }, function (err, user) {
        //     if (err) {
        //         return done(err);
        //     }
        //     //No user was found... so create a new user with values from Google (all the profile. stuff)
        //     if (!user) {
        //         user = new User({
        //             name: profile.displayName,
        //             email: profile.emails[0].value,
        //             username: profile.username,
        //             provider: 'facebook',
        //             //now in the future searching on User.findOne({'facebook.id': profile.id } will match because of this next line
        //             facebook: profile._json
        //         });
        //         user.save(function (err) {
        //             if (err) console.log(err);
        //             return done(err, user);
        //         });
        //     } else {
        //         //found user. Return
        //         return done(err, user);
        //     }
        // });
    }
));

// GET /auth/google
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in Google authentication will involve
//   redirecting the user to google.com.  After authorization, Google
//   will redirect the user back to this application at /auth/google/callback
app.get('/auth/google',
    passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/plus.login'] }));

// GET /auth/google/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    function (req, res) {
        res.redirect('/');
    });


app.get('/', (req, res) => {    
    res.render('index');
});

app.get('/game/create', (req, res) => {
    if (req.user === undefined) {
        res.redirect('/login');
    } else {
        Character.find({}, (err, characters) => {
            res.render('create', { characters: characters });
        });
    }
});

app.post('/game/create', (req, res) => {
    let characters = req.body.characters;
    const gameID = req.body.gameID;
    const numberOfServants = +req.body.numberOfServants;
    const numberOfMinions = +req.body.numberOfMinions;

    for (let i = 0; i < numberOfServants; i++) {
        characters.push('Loyal Servant of Arthur');
    }

    for (let i = 0; i < numberOfMinions; i++) {
        characters.push('Minion of Mordred');
    }

    characters = shuffle(characters);

    const newGame = new Game({
        gameID: gameID,
        players: [{
            name: req.user.name,
            character: characters.pop()
        }],
        characters: characters,
        quests: []
    });


    newGame.save((err, savedGame) => {
        if (err) {
            console.log(err);
        } else {
            // req.locals.gameID = ""+savedGame._id.slice(0, 5);
            // savedGame.gameID = req.locals.gameID;
            // savedGame.save((err, savedGameWithID) => {
            //     if (err) {
            //         console.log(err);
            //     } else {
            //         console.log(savedGameWithID);
            //         res.render('host');                    
            //     }
            // });
            console.log(savedGame);

            res.redirect('/game/host/' + gameID);

        }
    });

    // const GameSchema = new mongoose.Schema({
    //     players: [{
    //         name: { type: String, required: true },
    //         character: { type: String, required: true }
    //     }],
    //     quests: [QuestSchema]
    // });

    // Game.find({}, (err, games) => {
    //     const statusBoolean = req.body.gridRadios === "success" ? true : false;

    //     const newQuest = new Quest({
    //         numOfPlayers: req.body.numOfPlayers,
    //         players: req.body.players,
    //         success: statusBoolean
    //     });
    //     games[0].quests.push(newQuest);
    //     games[0].save((err, updatedGame) => {
    //         if (err) {
    //             console.log(err);

    //         }
    //         if (!err) {
    //             console.log(updatedGame.quests);
    //         }
    //     });
    //     res.redirect('/game/play');
    // });
});

app.get('/game/join', (req, res) => {
    res.render('join');
});

app.post('/game/join', (req, res) => {
    const gameID = req.body.gameID;
    const query = {
        gameID: gameID
    };
    Game.findOne(query, (err, game) => {
        if (!err) {
            if (game) {
                res.redirect('/game/host/' + gameID);
                // res.render('lobby', { players: game.players });

            } else {
                res.redirect('/game/join');
            }
        } else {
            console.log(err);
            // res.redirect('/');
        }
    });
    // Game.find({}, (err, games) => {
    //     if (err) {
    //         console.log(err);
    //     } else {
    //         games = games.filter((game) => {
    //             return game.id.includes(gameID);
    //         });
    //         let hostPath = '/game/host/';
    //         hostPath = hostPath.concat(games[0]);
    //         res.redirect(hostPath);
    //     }
    // });
});

app.get('/game/play', (req, res) => {
    Game.find({}, (err, games) => {
        res.render('playtest', { quests: games[0].quests });
    });
});

app.get('/game/play/:gameID', (req, res) => {
    if (req.user === undefined) {
        res.redirect('/login');
    } else {
        const gameID = req.params.gameID;
        const name = req.user.name;

        const query = {
            gameID: gameID
        };
        
        Game.findOne(query, (err, game) => {
            const context = {};
            game.players.forEach(player => {
                if (player.name === name) {
                    Character.findOne({name: player.character}, (err, character) => {
                        context.character = character;
                        context.quests = game.quests;
                        context.knowledge = [];
                        context.gameID = gameID;
                        
                        game.players.forEach(player => {
                            if (character.knowledge.includes(player.character)) {
                                context.knowledge.push(player.name);
                            }
                        });
                        
                        // character.knowledge.forEach(otherChar => {
                            
                        // });
                        res.render('play', context);
                    });
                }
            });
        });
    }
});

app.get('/game/host/:gameID', (req, res) => {
    if (req.user === undefined) {
        res.redirect('/login');
    } else {
        const gameID = req.params.gameID;

        const query = {
            gameID: gameID
        };



        Game.findOne(query, (err, game) => {
            if (!err) {
                // console.log(game);
                let playerExists = false;
                game.players.forEach((player) => {
                    if (player.name === req.user.name) {
                        playerExists = true;
                    }
                    // Object.keys(player).forEach(function (key) {
                    //     if (player[key] === req.user) {
                    //         alert('exists');
                    //     }
                    // });
                });

                if (!playerExists) {
                    game.players.push({ name: req.user.name, character: game.characters.pop() });
                }

                game.save();

                res.render('lobby', { gameID: gameID }/* , { players: game.players } */);
                // res.render('lobby', { players: game.players });

            } else {
                console.log(err);
                // res.redirect('/');
            }
        });

        // res.render('lobby');



    }

});

app.post('/game/host/:gameID', (req, res) => {
    if (req.user === undefined) {
        res.redirect('/login');
    } else {
        const query = {
            gameID: req.params.gameID
        };
        Game.findOne(query, (err, game) => {
            if (!err) {
                res.render('lobby', { players: game.players });
            } else {
                console.log(err);
                // res.redirect('/');
            }
        });
    }

});

app.get('/debug', (req, res) => {
    Game.find({}, (err, games) => {
        console.log(games[0].quests);
        res.redirect('/');
    });
});

app.get('/quest/add', (req, res) => {
    Game.find({}, (err, games) => {
        res.render('quest-add', { players: games[0].players });
    });
});

app.post('/quest/add', (req, res) => {
    Game.find({}, (err, games) => {
        const statusBoolean = req.body.gridRadios === "success" ? true : false;

        const newQuest = new Quest({
            numOfPlayers: req.body.numOfPlayers,
            players: req.body.players,
            success: statusBoolean
        });
        games[0].quests.push(newQuest);
        games[0].save((err, updatedGame) => {
            if (err) {
                console.log(err);
            }
            if (!err) {
                console.log(updatedGame.quests);
            }
        });
        res.redirect('/game/play');
    });
});

app.get('/login', (req, res) => {
    res.render('login');
});

// app.post('/login', (req, res) => {

// });

io.on('connection', (socket) => {
    console.log(socket.id, 'has connected');

    socket.on('newPlayerConnected', (gameID) => {
        Game.findOne({ gameID: gameID }, (err, game) => {
            socket.emit('showPlayers', game.players);
            socket.broadcast.emit('showPlayers', game.players);
        });
    });

    socket.on('playBtnPressed', (data) => {
        socket.emit('startGame', data);
        socket.broadcast.emit('startGame', data);
    });

    socket.on('playScreenLoaded', (gameID) => {
        Game.findOne({ gameID: gameID }, (err, game) => {
            socket.emit('showQuests', game.quests);
            socket.broadcast.emit('showQuests', game.quests);
        });
    });
});

server.listen(process.env.PORT || 3000);
