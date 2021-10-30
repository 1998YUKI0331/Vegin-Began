var mongoose = require("mongoose");

var BoardSchema = new mongoose.Schema({
    id: { type:Number, unique:true },
    title: String,
    content: String,
    date: String,
    writer: String,
    tag: String
});

module.exports = mongoose.model('Board', BoardSchema);