const express = require("express");
const router = express.Router();

const Users = require('../models/User');

router.post('/', (req, res) => {
	Users.findOne({ username: req.body.username }).select('likeList').exec(function(err,user){
		res.send(user.likeList);
 	});
});

router.post('/add', async (req, res) => {
	await Users.findOneAndUpdate(
		{ username: req.body.username },
		{ $addToSet : {likeList: req.body.phone }})
		.exec();
	Users.findOne({ username: req.body.username }).select('likeList').exec(function(err,user){
		res.send(user.likeList);
	});
});

router.post('/delete', async (req, res) => {
	await Users.findOneAndUpdate(
		{ username: req.body.username },
		{ $pull : {likeList: req.body.phone }})
		.exec();
	Users.findOne({ username: req.body.username }).select('likeList').exec(function(err,user){
		res.send(user.likeList);
	});
});

module.exports = router;