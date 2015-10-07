var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var MessageSchema = new Schema({
    user: { type: String, required: true },         // Sender
    msg: { type: String, required: true },          // Message
    timestamp: { type: Date, required: true }       // Message timestamp
});

module.exports = mongoose.model('Message', MessageSchema);
