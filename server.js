const express = require("express");
const app = express();
const bodyParser = require('body-parser');
var mongoose = require('mongoose');
const path = require('path');
const cookieParser = require('cookie-parser');
const PORT = 3000;

var db = mongoose.connect('mongodb://yuki:1234@localhost:27017/yuki', (err) => {
	if (err) { console.log(err.message); } 
  	else { console.log('Succesfully Connected!'); }
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended : false}));
app.use(express.static(path.join(__dirname + "/public")));

app.set('views', __dirname + '\\views');
app.set('view engine','ejs');

const BoardRouter = require('./routes/BoardRouter');
const LikeRouter = require('./routes/LikeRouter');
const UserRouter = require('./routes/UserRouter');
const VeganRouter = require('./routes/VeganRouter');

app.use('/board', BoardRouter);
app.use('/like', LikeRouter);
app.use('/', UserRouter);
app.use('/vegan', VeganRouter);

app.listen(PORT, () => { console.log(`Listen : ${PORT}`); });