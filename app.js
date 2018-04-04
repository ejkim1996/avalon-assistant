const express = require('express');
const mongoose = require('mongoose');
const validate = require('validate');

require('./db');
const Quest = mongoose.model('Quest');
const Game = mongoose.model('Game');

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
    res.locals.user = req.session.user;
    next();
});

app.get('/', (req, res) => {

});

app.get('/game/host', (req, res) => {

});

app.get('/game/join', (req, res) => {

});

app.post('/game/join', (req, res) => {

});

app.get('/game/play', (req, res) => {

});

app.get('/quest/add', (req, res) => {

});

app.post('/quest/add', (req, res) => {

});

app.get('/login', (req, res) => {
    
});

app.post('/login', (req, res) => {

});

app.listen(3000);
