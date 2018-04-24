// express setup
const express = require('express');
const session = require('express-session');
const app = express();
const path = require('path');

// passport setup
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

// get mongoose models
require('./db');
const mongoose = require('mongoose');
const Quest = mongoose.model('Quest');
const Game = mongoose.model('Game');
const User = mongoose.model('User');
const Character = mongoose.model('Character');

// shuffle setup
const shuffle = require('shuffle-array');

// socket.io setup
const server = require('http').Server(app);
const io = require('socket.io')(server);

// handlebars setup
app.set('view engine', 'hbs');

// middleware setup
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

// set up passport login state support
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
        User.findOne({ googleID: profile.id }, function (err, user) {
            if (!user) {
                user = new User({
                    name: profile.displayName,
                    googleID: profile.id,
                    provider: 'google'
                });
                user.save(function (err /* savedUser */) {
                    // if (err) {
                    //     console.log(err);
                    // }
                    // console.log(savedUser);

                    return done(err, user);
                });
            } else {
                return done(err, user);
            }
        });
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

// GET /
//   Home page
app.get('/', (req, res) => {
    res.render('index');
});

// GET /game/create
//   Page to create a game by choosing game name and characters
app.get('/game/create', (req, res) => {
    if (req.user === undefined) {
        res.redirect('/login');
    } else {
        Character.find({}, (err, characters) => {
            res.render('create', { characters: characters });
        });
    }
});

// POST /game/create
//   Get form data to create a game
//   and send player to the lobby
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
            character: characters.pop() // assign character to game creator
        }],
        characters: characters,
        quests: []
    });

    newGame.save((err, savedGame) => {
        if (err) {
            // console.log(err);
            res.redirect('/game/create');
        } else {
            console.log(savedGame);
            res.redirect('/game/lobby/' + savedGame.gameSlug);
        }
    });
});

// GET /game/join
//   Page where players can join games by game ID (name)
app.get('/game/join', (req, res) => {
    if (req.user === undefined) {
        res.redirect('/login');
    } else {
        res.render('join');
    }
});

// POST /game/join
//   Get game ID input from form to send 
//   player to the correct lobby.
app.post('/game/join', (req, res) => {
    Game.findOne({ gameID: req.body.gameID }, (err, game) => {
        if (!err) {
            if (game) {
                const gameSlug = req.body.gameID.replace(/\s+/g, '-').toLowerCase();
                res.redirect('/game/lobby/' + gameSlug);
            } else {
                res.redirect('/game/join');
            }
        } else {
            console.log(err);
            res.redirect('/game/join');
        }
    });
});

// GET /game/lobby/:gameSlug
//   
app.get('/game/lobby/:gameSlug', (req, res) => {
    if (req.user === undefined) {
        res.redirect('/login');
    } else {
        const gameSlug = req.params.gameSlug;

        Game.findOne({gameSlug: gameSlug}, (err, game) => {
            if (!err) {
                // console.log(game);
                let playerExists = false;
                game.players.forEach((player) => {
                    if (player.name === req.user.name) {
                        playerExists = true;
                    }
                });

                if (!playerExists) {
                    game.players.push({ name: req.user.name, character: game.characters.pop() });
                }

                game.save();

                res.render('lobby', { gameID: game.gameID }/* , { players: game.players } */);
                // res.render('lobby', { players: game.players });

            } else {
                console.log(err);
                // res.redirect('/');
            }
        });

        // res.render('lobby');



    }

});

app.post('/game/lobby/:gameSlug', (req, res) => {
    if (req.user === undefined) {
        res.redirect('/login');
    } else {
        const query = {
            gameID: req.params.gameID
        };
        Game.findOne({gameSlug: req.params.gameSlug}, (err, game) => {
            if (!err) {
                res.render('lobby', { players: game.players });
            } else {
                console.log(err);
                // res.redirect('/');
            }
        });
    }

});

/* 
app.get('/game/play', (req, res) => {
    Game.find({}, (err, games) => {
        res.render('playtest', { quests: games[0].quests });
    });
});
 */

app.get('/game/play/:gameSlug', (req, res) => {
    if (req.user === undefined) {
        res.redirect('/login');
    } else {
        const gameID = req.params.gameID;
        const name = req.user.name;

        const query = {
            gameID: gameID
        };

        Game.findOne({gameSlug: req.params.gameSlug}, (err, game) => {
            const context = {};
            game.players.forEach(player => {
                if (player.name === name) {
                    Character.findOne({ name: player.character }, (err, character) => {
                        context.character = character;
                        context.quests = game.quests;
                        context.knowledge = [];
                        context.gameID = game.gameID;

                        game.players.forEach(player => {
                            if (character.knowledge.includes(player.character)) {
                                context.knowledge.push(player.name);
                            }
                        });
                        res.render('play', context);
                    });
                }
            });
        });
    }
});

/* 
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
 */

app.get('/quest/add/:gameSlug', (req, res) => {
    Game.findOne({gameSlug: req.params.gameSlug}, (err, game) => {
        res.render('quest-add', { players: game.players, gameID: req.params.gameID, gameSlug: game.gameSlug });
    });
});

app.post('/quest/add/:gameSlug', (req, res) => {
    Game.findOne({gameSlug: req.params.gameSlug}, (err, game) => {
        const statusBoolean = req.body.gridRadios === "success" ? true : false;
        const questNum = +game.quests.length + 1;

        const newQuest = new Quest({
            numOfPlayers: req.body.numOfPlayers,
            players: req.body.players,
            success: statusBoolean,
            questNum: 'quest' + questNum
        });
        console.log('req body', req.body);
        
        game.quests.push(newQuest);
        game.save((err, updatedGame) => {
            if (err) {
                console.log(err);
            }
            if (!err) {
                console.log(updatedGame.quests);
            }
        });
        res.redirect('/game/play/' + req.params.gameSlug);
    });
});

app.get('/quest/:gameSlug/:questNum', (req, res) => {
    Game.findOne({ gameSlug: req.params.gameSlug }, (err, game) => {    
        console.log(req.params.questNum);
        
        // const context = { quest: game.quests.filter(quest => quest._id === req.params.questID)};
        const context = {};
        for (let i = 0; i < game.quests.length; i++) {            
            if (game.quests[i].questNum === req.params.questNum) {
                context.players = game.quests[i].players;
                context.playersLength = game.quests[i].players.length;                
                context.success = game.quests[i].success;
                context.questNumber = i + 1;
            }
        }
        context.gameID = game.gameID;
        // console.log(context);
        
        res.render('quest-detail', context);
    });
});

app.get('/login', (req, res) => {
    res.render('login');
});

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
            socket.emit('showQuests', { quests: game.quests, gameSlug: game.gameSlug });
            socket.broadcast.emit('showQuests', { quests: game.quests, gameSlug: game.gameSlug });
        });
    });
});

server.listen(process.env.PORT || 3000);
