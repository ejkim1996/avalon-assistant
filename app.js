const express = require('express');
const mongoose = require('mongoose');
// const validate = require('validate.js');
const passport = require('passport');
// const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

require('./db');
const Quest = mongoose.model('Quest');
const Game = mongoose.model('Game');
// const User = mongoose.model('User');

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

// // Use the GoogleStrategy within Passport.
// //   Strategies in Passport require a `verify` function, which accept
// //   credentials (in this case, an accessToken, refreshToken, and Google
// //   profile), and invoke a callback with a user object.
// passport.use(new GoogleStrategy({
//     clientID: GOOGLE_CLIENT_ID,
//     clientSecret: GOOGLE_CLIENT_SECRET,
//     callbackURL: "http://www.example.com/auth/google/callback"
// },
//     function (accessToken, refreshToken, profile, done) {
//         User.findOrCreate({ googleId: profile.id }, function (err, user) {
//             return done(err, user);
//         });
//     }
// ));

// add req.session.user to every context object for templates
app.use((req, res, next) => {
    res.locals.user = req.session.user;
    next();
});

app.get('/', (req, res) => {
    res.render('index');
});

app.get('/game/create', (req, res) => {

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
    Game.find({}, (err, games) => {
        res.render('play', {quests: games[0].quests});
    });
});

app.get('/debug', (req, res) => {
    Game.find({}, (err, games) => {
        console.log(games[0].quests);
        res.redirect('/');
    });
});

app.get('/quest/add', (req, res) => {
    Game.find({}, (err, games) => {
        res.render('quest-add', { players: games[0].players});        
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

});

app.post('/login', (req, res) => {

});

// // GET /auth/google
// //   Use passport.authenticate() as route middleware to authenticate the
// //   request.  The first step in Google authentication will involve
// //   redirecting the user to google.com.  After authorization, Google
// //   will redirect the user back to this application at /auth/google/callback
// app.get('/auth/google',
//     passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/plus.login'] }));

// // GET /auth/google/callback
// //   Use passport.authenticate() as route middleware to authenticate the
// //   request.  If authentication fails, the user will be redirected back to the
// //   login page.  Otherwise, the primary route function function will be called,
// //   which, in this example, will redirect the user to the home page.
// app.get('/auth/google/callback',
//     passport.authenticate('google', { failureRedirect: '/login' }),
//     function (req, res) {
//         res.redirect('/');
//     });

app.listen(process.env.PORT || 3000);
