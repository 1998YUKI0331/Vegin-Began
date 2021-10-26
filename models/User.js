var mongoose = require("mongoose");

var UserSchema = new mongoose.Schema({
    username: String, //아이디
    password: String, //비밀번호
});

module.exports = mongoose.model('User', UserSchema);