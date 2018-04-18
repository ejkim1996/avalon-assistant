const express = require('express');
const mongoose = require('mongoose');
// const validate = require('validate.js');
const passport = require('passport');
const shuffle = require('shuffle-array')
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const GOOGLE_CLIENT_ID = "632766466320-ntejgmhjef384di7cf1aqduicbie1ish.apps.googleusercontent.com";
const GOOGLE_CLIENT_SECRET = "MTPjF9oONiEwF3cLQ-gW-oeg";

require('./db');
const Quest = mongoose.model('Quest');
const Game = mongoose.model('Game');
const User = mongoose.model('User');
const Character = mongoose.model('Character');

const session = require('express-session');
const path = require('path');

const app = express();

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
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:5000/auth/google/callback"
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
    const characters = req.body.characters;
    const numberOfServants = +req.body.numberOfServants;
    const numberOfMinions = +req.body.numberOfMinions;

    for (let i = 0; i < numberOfServants; i++) {
        characters.push('Loyal Servant of Arthur');
    }

    for (let i = 0; i < numberOfMinions; i++) {
        characters.push('Minion of Mordred');
    }

    shuffle(characters);

    const newGame = new Game({
        players: [{
            name: req.user.name,
            character: characters.pop()
        }],
        characters: characters,
        quests: []
    });
    console.log(newGame);
    

    newGame.save((err, savedGame) => {
        if (err) {
            console.log(err);
        } else {
            req.locals.gameID = ""+savedGame._id.slice(0, 5);
            savedGame.gameID = req.locals.gameID;
            savedGame.save((err, savedGameWithID) => {
                if (err) {
                    console.log(err);
                } else {
                    console.log(savedGameWithID);
                    res.render('host');                    
                }
            });
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

    Game.find({}, (err, games) => {
        if (err) {
            console.log(err);
        } else {
            games = games.filter((game) => {
                return game.id.includes(gameID);
            });
            let hostPath = '/game/host/';
            hostPath = hostPath.concat(games[0]);
            res.redirect(hostPath);
        }
    });
});

app.get('/game/play', (req, res) => {
    if (req.user === undefined) {
        res.redirect('/login');
    } else {
        Game.find({}, (err, games) => {
            res.render('play', { quests: games[0].quests });
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



app.listen(process.env.PORT || 3000);
