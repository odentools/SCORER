/**
	RoboCup Jr.SCORER server
**/
var express = require('express');
var app		= express();
var	fs		= require("fs");

// wwwディレクトリを静的ファイルディレクトリとして登録
app.use(express.static('www'));

// サーバを開始
var server = app.listen(3000, function () {
	var host = this.address().address;
	var port = this.address().port;

	console.log('Server listening at http://%s:%s', host, port);
});

var socketIO = require('socket.io');
var scoa_io = socketIO.listen(8081);	// スコアの受け取り用
var guide_io = socketIO.listen(8082);	// 案内用
var manage_io = socketIO.listen(8083);	// 運営用


var infoIo		= socketIO.listen(3001);		// 各種情報(チーム情報など)
var competIo	= socketIO.listen(3002);		// 競技情報（時間など）


// ゲーム時間の記録変数
var gameTime="";

competIo.sockets.on("connection", function (socket) {

	socket.on("time", function (data) {
		gameTime = data;
		competIo.sockets.emit("time", data);
	});

});


/* 各種情報（チーム情報など [index]） */
infoIo.sockets.on("connection", function (socket) {

	// 参加者リスト
	// ToDo ファイルから読み込む
	var data = {
		'ロボカップジャパンオープン2016愛知 RescueMaze(メイズ)':{
			'index': 'kansai_meiz',
			'field': 'meiz',
			'team':{
				'埼玉県立川越高等学校物理部': 'JRM001',
				'Atlantis': 'JRM002',
				'しーぼーぐ': 'JRM003',
				'DMS-空': 'JRM004',
				'DMS-鷹': 'JRM005',
				'LINQ': 'JRM006',
				'中央中等W': 'JRM007',
				'Oremon Cha-rangers': 'JRM008',
				'seek': 'JRM009',
				'聖徳太子１号': 'JRM010',
				'ＳＵＮ': 'JRM011',
				'MAC Robot Team': 'JRM012'
			}
		}
	};

	// 競技情報
	var nowConnection;

	socket.on('nowConnection', function(data) {
		if (data != null) {
			nowConnection = data;
		}
		socket.emit('nowConnection', nowConnection);
	});

	// 参加者リスト一覧の取得
	socket.on("participantList", function () {
		socket.emit('participantList', data);
	});

});


guide_io.sockets.on("connection", function (socket) {

	console.log("クライアントの接続を確認しました。");

	socket.on("remove", function () {
		guide_io.emit('remove');
	});

	socket.on("start", function () {
		socket.broadcast.emit('clear');
		guide_io.emit('clear');
	});

	socket.on("guide", function (data) {
		guide_io.emit('guide', data);
		console.log(data);
	});
	
	socket.on("endguide", function (data) {
		socket.broadcast.emit('endguide', data);
		console.log(data);
	});

	socket.on("info", function (data) {
		socket.broadcast.emit('info', data);
		console.log(data);
	});

});


scoa_io.sockets.on("connection", function (socket) {

	console.log("クライアントの接続を確認しました。");

	socket.on("sumScoa", function (data) {
		console.log(data);
	});

	socket.on("scoaData", function (data) {
		console.log(data);
	});

	socket.on("endGame", function (data) {

		data['競技時間'] = gameTime.time;
		scoa_io.sockets.emit("aaaaaaaa", data);
		console.log(data);

		var char = "";

		// ヘッダー行の出力
		for (var key in data) {
			if (data[key]['scoa'] != undefined){
				for (var k in data[key]){
					char = char+(key+k)+"\t";
				}
			} else{
				char = char+(key)+"\t";
			}
		}
		char = char+"\n";

		// スコアの出力
		for (var key in data) {
			if (data[key]['scoa'] != undefined){
				for (var k in data[key]){
					char = char+(data[key][k])+"\t";
				}
			} else{
				char = char+(data[key])+"\t";
			}
		}
		char = char+"\n";

		manage_io.sockets.emit("html", char);

		fs.appendFile('log.csv', char, 'utf8', function (err) {
			if(err) console.log(err);
		});
	});

});



var port = 9001;
var io = require('socket.io').listen(port);

console.log((new Date()) + " Server is listening on port " + port);

io.sockets.on('connection', function(socket) {

	// 動画の受信
	socket.on('sendVideo', function(message) {

		socket.broadcast.emit('VideoReceiver', message);

	});

	socket.on('message', function(message) {
		socket.broadcast.emit('message', message);
	});

	socket.on('video', function(message) {
		socket.broadcast.emit('video', message);
	});

	socket.on('disconnect', function() {
		socket.broadcast.emit('user disconnected');
	});

});
