const mongoose = require('mongoose');
const URLSlugs = require('mongoose-url-slugs');

// users
// * our site requires authentication...
// * so users have a username, name, and password
const UserSchema = new mongoose.Schema({
    // username provided by authentication plugin
    name: String,
    // name provided by authentication plugin
    // password hash provided by authentication plugin
    // email: String,
    googleID: String,
    provider: String,
    // google: {}
});

// a quest within a game
// * includes number of characters that went on the quest
// * includes the usernames of the characters on the quest
// * records the success/failure of the quest
const QuestSchema = new mongoose.Schema({
    numOfPlayers: { type: Number, min: 2, required: true },
    players: [{ type: String, required: true }],
    success: { type: Boolean, required: true },
    questNum: { type: String, required: true }
});

// a character
// * stores details of a character
// * knowledge stores an array names of characters that 
//   the character needs knowledge of
const CharacterSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    knowledge: [{ type: String, required: true }],
    select: Boolean
});

// a game
// * stores current quests
// * has an array of players that associates names of
//   players with their characters
const GameSchema = new mongoose.Schema({
    gameID: { type: String, unique: true },
    players: [{
        name: { type: String, required: true },
        character: { type: String, required: true }
    }],
    characters: [{ type: String, required: true }],
    quests: [QuestSchema]
});

GameSchema.plugin(URLSlugs('gameID', { field: 'gameSlug' }));

mongoose.model('User', UserSchema);
mongoose.model('Quest', QuestSchema);
mongoose.model('Character', CharacterSchema);
mongoose.model('Game', GameSchema);

mongoose.connect(process.env.MONGODB_URI);
