const express = require("express");
const router = express.Router();
const xlsx = require('xlsx');

const excelFile = xlsx.readFile('datas/서울시 채식 음식점 현황관리 리스트_202110291941.xlsx');
const sheetName = excelFile.SheetNames[0];      // 첫번째 시트 정보 추출
const firstSheet = excelFile.Sheets[sheetName]; // 시트의 제목 추출

router.post('/', (req, res) => {
	var Vegan = new Array();

	for (var i = 2; i < 974; i++) {
		var col = "D" + String(i);
		if (firstSheet[col].v !== "") {
			var data = new Object();
			data.phone = firstSheet[col].v;
			Vegan.push(data);
		}
	}
	
	var jsonData = JSON.stringify(Vegan);
	res.send(jsonData);
});

router.post('/theme', (req, res) => {
	var Vegan = new Array();

	for (var i = 2; i < 974; i++) {
		var colPhone = "D" + String(i);
		var colTheme = "C" + String(i);
		if (firstSheet[colTheme].v == req.body.theme) {
			var data = new Object();
			data.phone = firstSheet[colPhone].v;
			Vegan.push(data);
		}
	}
	
	var jsonData = JSON.stringify(Vegan);
	res.send(jsonData);
});

router.post('/menu', (req, res) => {
	var Vegan = new Array();

	for (var i = 2; i < 974; i++) {
		var colPhone = "D" + String(i);
		var colMenu = "G" + String(i);
		if (firstSheet[colPhone].v == req.body.phone) {
			var data = new Object();
			data.menu = firstSheet[colMenu].v;
			Vegan.push(data);
		}
	}
	
	var jsonData = JSON.stringify(Vegan);
	res.send(jsonData);
});

module.exports = router;