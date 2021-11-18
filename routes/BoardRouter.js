const express = require("express");
const router = express.Router();

const Boards = require('../models/Board');

router.post('/', async (req, res) => {
	Boards.find().exec(function(err,board){
		res.send(board);
	});
});

router.post('/tag', async (req, res) => {
	Boards.find({ tag: req.body.tag }).exec(function(err,board){
		res.send(board);
	});
});

router.post('/content', async (req, res) => {
	Boards.findOne({ _id: req.body._id }).exec(function(err,board){
		res.send(board);
 	});
});

router.post('/add', async (req, res) => {
	await Boards.insertMany({
		id: req.body.id,
		title: req.body.title,
		content: req.body.content,
		date: req.body.date,
		writer: req.body.writer,
		tag: req.body.tag
	}, function(err, res) {
		if (err) throw err;
	});
	Boards.find().exec(function(err,board){
		res.send(board);
	});
});

router.post('/delete', (req, res) => {
	Boards.deleteOne({ _id: req.body._id }, function(err, res) {
		if (err) throw err;
	});
	Boards.find().exec(function(err,board){
		res.send(board);
	});
});

router.post('/edit', async (req, res) => {
	await Boards.findOneAndUpdate(
		{ _id: req.body._id },
		{ title: req.body.title, content:req.body.content })
		.exec();
	Boards.findOne({ _id: req.body._id  }).exec(function(err,board){
		res.send(board);
	});
});

module.exports = router;