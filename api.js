/**
 * RoboCup Jr.SCORER server
 */
'use strict';

var express = require('express'),
	bodyParser = require('body-parser');

var app = express();
app.use(bodyParser.json());

// ルート
app.get('/', function (req, res) {
	res.send('It works :)');
});

// ルート - API
var robotsApi = require(__dirname + '/routes/robots');
app.get('/robots', robotsApi.find);
app.get('/robots/:id', robotsApi.findById);
app.post('/robots', robotsApi.create);
app.post('/robots/:id', robotsApi.update);
app.delete('/robots/:id', robotsApi.delete);

var teamsApi = require(__dirname + '/routes/teams');
app.get('/teams', teamsApi.find);
app.get('/teams/:id', teamsApi.findById);
app.post('/teams', teamsApi.create);
app.post('/teams/:id', teamsApi.update);
app.delete('/teams/:id', teamsApi.delete);

var competitionsApi = require(__dirname + '/routes/competitions');
app.get('/competitions', competitionsApi.find);
app.get('/competitions/:id', competitionsApi.findById);
app.post('/competitions', competitionsApi.create);
app.post('/competitions/:id', competitionsApi.update);
app.delete('/competitions/:id', competitionsApi.delete);

var contestsApi = require(__dirname + '/routes/contests');
app.get('/contests', contestsApi.find);
app.get('/contests/:id', contestsApi.findById);
app.post('/contests', contestsApi.create);
app.post('/contests/:id', contestsApi.update);
app.delete('/contests/:id', contestsApi.delete);

var competitionNamesApi = require(__dirname + '/routes/competition_names');
app.get('/competitionNames', competitionNamesApi.find);
app.get('/competitionNames/:id', competitionNamesApi.findById);
app.post('/competitionNames', competitionNamesApi.create);
app.post('/competitionNames/:id', competitionNamesApi.update);
app.delete('/competitionNames/:id', competitionNamesApi.delete);

var contestNamesApi = require(__dirname + '/routes/contest_names');
app.get('/contestNames', contestNamesApi.find);
app.get('/contestNames/:id', contestNamesApi.findById);
app.post('/contestNames', contestNamesApi.create);
app.post('/contestNames/:id', contestNamesApi.update);
app.delete('/contestNames/:id', contestNamesApi.delete);

// サーバの開始
var server = app.listen(3000, function () {

	var host = server.address().address;
	var port = server.address().port;

	console.log('Server listening at http://' + host + ':' + port);

});
