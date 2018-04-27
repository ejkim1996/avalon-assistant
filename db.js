const mongoose = require('mongoose');
const URLSlugs = require('mongoose-url-slugs');

// users
// * our site requires authentication using google-oauth-2
const UserSchema = new mongoose.Schema({
    name: String,
    googleID: String,
    provider: String,
});

// a quest within a game
// * includes number of players that went on the quest
// * includes the usernames of the players on the quest
// * records the success/failure of the quest
// * records order of quest (1st, 2nd, etc.)
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
// * allegiance - 'good', 'evil', or 'neither'
// * select - for generic good and bad characters
//   there should be a select option to choose more than one
const CharacterSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    knowledge: [{ type: String, required: true }],
    allegiance: { type: String, required: true},
    select: Boolean
});

// a game
// * stores gameID and gameSlug (provided by mongoose-url-slugs)
// * stores current quests
// * has an array of players that associates names of
//   players with their characters
// * has an array that stores characters when the game is first made
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
