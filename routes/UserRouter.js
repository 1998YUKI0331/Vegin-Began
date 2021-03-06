const express = require("express");
const router = express.Router();
const session = require('express-session');
const crypto = require('crypto'); // 유저 비밀번호 암호화
const FileStore = require('session-file-store')(session); // 세션을 파일에 저장

const Users = require('../models/User');

router.use(session({
	secret: 'secretcode',
	resave: false,
	saveUninitialized: true,
	store : new FileStore()
}));

router.get("/", (req, res) => {
	console.log(req.session);
	if(req.session.is_logined == true) {
		res.render('index', { is_logined: req.session.is_logined, username: req.session.username });
	} else{ res.render('index',{ is_logined: false });
	}
});

router.get("/signup", (req, res) => { res.render('signup'); });
router.get("/login", (req, res) => { res.render('login'); });
router.get('/logout',(req, res) => { req.session.destroy(function(err){ res.redirect('/'); });});
router.get("/board", (req, res) => { 
	if(req.session.is_logined == true) {
		res.render('board', { is_logined: req.session.is_logined, username: req.session.username });
	} else{ res.render('board',{ is_logined: false });
	}
});
router.get("/content", (req, res) => { 
	if(req.session.is_logined == true) {
		res.render('content', { is_logined: req.session.is_logined, username: req.session.username });
	} else{ res.render('content',{ is_logined: false });
	}
});

router.post('/signup', (req, res) => {
	crypto.randomBytes(64, (err, buf) => {
		const salt = buf.toString('base64');
		crypto.pbkdf2(req.body.password, salt, 100000, 64, 'sha512', (err, key) => {
			const hash = key.toString('base64');
			var new_user = new Users({ username: req.body.username, password: hash, salt: salt});

			new_user.save((err) => {
				if (err) return res.status(500).json({ message: '저장 실패!' });
				else {
					res.redirect('/login');
				}
			});
		})
	})
});

router.post("/login", (req, res) => { 
	Users.findOne({ username: req.body.username }, (err, user) => {
		if (err) return res.status(500).json({ message: '에러!' });
		else if (user) {
			crypto.pbkdf2(req.body.password, user.salt, 100000, 64, "sha512", (err, key) => {
				const hash = key.toString("base64");
				if (hash === user.password) {
					req.session.is_logined = true;
					req.session.username = req.body.username;
					req.session.save(function(){ 
						res.render('index', { // 로그인 정보 전달
							username: req.body.username,
							is_logined : true
						});
					});
				} else {
					return res.status(404).json({ message: '비밀번호 틀림!' });
				}
			});
		}
		else return res.status(404).json({ message: '유저 없음!' });
	});
});

module.exports = router;