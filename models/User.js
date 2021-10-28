var mongoose = require("mongoose");

var UserSchema = new mongoose.Schema({
    username: String, //아이디
    password: String, //비밀번호
    likeList: [String] //찜목록
});

module.exports = mongoose.model('User', UserSchema);