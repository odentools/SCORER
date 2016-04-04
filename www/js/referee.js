/***********************
 * 競技審判jsファイル
 ***********************/

/* サーバのホストアドレスを取得 */
var getServerAddress = function() {
	return location.host.split(":")[0];
};


/* ------------------ */


// サーバーのホストアドレスを取得
var SERVER_ADDRESS = getServerAddress();


/* ------------------ */

var myApp = angular.module("myApp",[]);

myApp.controller("myCtrl", function($scope){

	$scope.Scoresheets = [
		{
			label: "被災者",
			type: "button",
			btn: [
				{name: "A", point: 15, is: false},
				{name: "B", point: 15, is: false},
				{name: "C", point: 15, is: false},
				{name: "D", point: 15, is: false},
				{name: "E", point: 15, is: false},
				{name: "F", point: 15, is: false},
				{name: "G", point: 15, is: false},
				{name: "H", point: 15, is: false}
			],
			total: 0
		},
		{
			label: "レスキューキット",
			type: "count",
			count: 0,
			unit: 10,
			total: 0
		},
		{
			label: "レスキューキット",
			type: "count",
			count: 0,
			unit: 10,
			total: 0
		}
	];

	$scope.addCount = function() {
		var ss = $scope.Scoresheets;
		var index = this.$parent.$index;
		ss[index].count++;
		ss[index].total = ss[index].unit * ss[index].count;

		// ブロードキャストで再計算

	};

	$scope.subtractCount = function() {
		var ss = $scope.Scoresheets;
		var index = this.$parent.$index;
		if(ss[index].count > 0) {
			ss[index].count--;
			ss[index].total = ss[index].unit * ss[index].count;
		}

		// ブロードキャストで再計算

	};

	$scope.clickButton = function() {
		var ss = $scope.Scoresheets;
		var row = this.$parent.$parent.$index;
		var col = this.$parent.$index;

		ss[row].btn[col].is = !ss[row].btn[col].is;
		
		// CSSを変更
		
		// トータルを再計算
		var total = 0;
		$.each( ss[row].btn, function(i, btn) {
			if(btn.is) total += btn.point;
		});
		
		ss[row].total = total;

		// ブロードキャストで再計算
		
	};

/*
	chatSocket.emit("scoaData", {team:scoaArray['チーム名'], itemId:itemId, allowance:allowance, unit:point, scoa:scoa, count:count});
	chatSocket.emit("sumScoa", {team:scoaArray['チーム名'], sumScoa:sumScoa});
	
	if($(parent).parent().parent().parent().parent().prev().text() == '競技進行の停止') {
		guideSocket.emit("guide", {msg:"競技進行の停止"+count+"回目です。", color:'red'});
	} else if(allowance == 0) {
		if(point>0) {
			guideSocket.emit("guide", {msg:$(parent).parent().parent().parent().parent().prev().text()+" "+count+"回目です。追加"+point+"点です。", color:'blue'});
		}
	}
	guideSocket.emit("info", {'大会名':scoaArray['大会名'], 'チーム名':scoaArray['チーム名'], 'field':scoaArray['field'],'合計':scoaArray['合計']});

*/

	$scope.$watch('Scoresheets', function() {
		// Todo: 小計から合計を再計算
	}, true);

});


/* ------------------ */

// Socket.IO Serverに接続する
var chatSocket = io.connect("http://"+SERVER_ADDRESS+":8081");
var guideSocket = io.connect("http://"+SERVER_ADDRESS+":8082");
var competIo	= io.connect("http://"+SERVER_ADDRESS+":3002");		// 競技情報（時間など）


// 現在コントローラで開いているボタン
var openControlElements;
var openControl2Elements;	// 終了 or リタイア

// 競技進行の停止の追加ボタンのID
var stopOfTheCompetitionProgressId;

// 被災者の追加ボタンID
var rescueId;

// レスキューキットの追加ボタンID
var rescueKitId;

// 採点項目の設定
var itemArray = {
	'line':{
		1:{'ドロップタイル1':{"1回目":60,"2回目":40,"3回目":20}},
		2:{'ドロップタイル2':{"1回目":60,"2回目":40,"3回目":20}},
		3:{'ドロップタイル3':{"1回目":60,"2回目":40,"3回目":20}},
		4:{'坂登り':{"1回目":30,"2回目":20,"3回目":10}},
		5:{'ギャップ':{"1":10,"2":10,"3":10}},
/*		6:{'バンプ':{"1":5,"2":5}},*/
		7:{'障害物':{"1":10}},
		8:{'カウント':{"交差点":15}},
		9:{'カウント':{"被災者救出":40}},
		10:{'カウント':{"競技進行の停止":0}} // カウントの場合は連想配列は絶対1つにする事.
	},
	'meiz':{
		1:{'被災者':{"A":10, "B":10, "C":10, "D":10, "E":10, "F":25,"G":25,"H":25}},
		2:{'レスキューキット':{"A":10, "B":10, "C":10, "D":10, "E":10, "F":10,"G":10, "H":10}},
		3:{'坂登り':{"1":20}},
		4:{'坂下り':{"1":10}},
		5:{'チェックポイント':{"a":10, "b":10, "c":10}},
		7:{'バンプ':{"①":5,"②":5,"③":5,"④":5}},
		8:{'カウント':{"被災者数":0}},
		9:{'カウント':{"レスキューキット数":0}},
		10:{'カウント':{"競技進行の停止":0}}
	}
};

// スコア計算用のテーブルを生成する。
var scoaArray;

var uniqueIdNumber = 0;


/* ---- */


/**
 * スコアテーブル用の配列を生成する。
 */
var makeScoaArray = function(itemArray) {
	var query = getQueryString();
	var array = {};

	array['合計'] = 0;
	array['チーム名'] = query['team'];
	array['大会名'] = query['tournamentName'];
	array['field'] = query['field'];

	$.each( itemArray[array['field']], function(i, list){
		$.each( list, function(itemName, gradingList){
			// カウント用の処理
			if (itemName == 'カウント') {
				if (getAssociationLength(gradingList) != 1) {
					return null;
				}
				$.each( gradingList, function(j, k){
					array[j] = {scoa:0, count:0};	// これは下と合してね
				});
			} else {
				array[itemName] = 0;
			}
		});
	});

	return array;
};


/**
 * URLからGETパラメータを取り出す。
 */
var getQueryString = function () {
	var result = {};

	if( 1 < window.location.search.length )
	{
		// 最初の1文字 (?記号) を除いた文字列を取得する
		var query = window.location.search.substring( 1 );

		// クエリの区切り記号 (&) で文字列を配列に分割する
		var parameters = query.split( '&' );

		for( var i = 0; i < parameters.length; i++ )
		{
			// パラメータ名とパラメータ値に分割する
			var element = parameters[ i ].split( '=' );

			var paramName = decodeURIComponent( element[ 0 ] );
			var paramValue = decodeURIComponent( element[ 1 ] );

			// パラメータ名をキーとして連想配列に追加する
			result[ paramName ] = paramValue;
		}
	}

	return result;
};


var getUniqueId = function(){
	var uniqueId = "scoringItem_" + uniqueIdNumber;
	uniqueIdNumber++;
	
	return uniqueId;
};


var addLines = function(array) {
	
	//連想配列に対するループ処理を実装
	$.each( array[scoaArray['field']], function(i, list){
		$.each( list, function(itemName, gradingList){
			// カウント用の処理
			if (itemName == 'カウント') {

			} else {
				$('#scoaTable').append(makeButtonHTML(itemName, gradingList));
			}
		});
	});
};

/**
 * 連想配列の要素数を調べる
 */
var getAssociationLength = function(array) {
	var count = 0;
	for (var j in array){
		count++;
	}
	return count;
};


/**
 * フッターHTMLの生成
 */
var makeSumHTML = function() {
	var code = "<tr><td class='nowrap'>合計</td><td>";
	
	//開始、終了、リタイア、失格
	code = code+"<a class='btn btn-light' data-btn='exitButton'>終了<a>";
	code = code+"<a class='btn btn-light' data-btn='retireButton'>リタイア<a>";
	code = code+"<a class='btn btn-light' data-btn='completeButton'>脱出<a>";
	code = code+"<a class='btn btn-light' data-btn='clearMonitor'>画面クリア<a>";
	code = code+"<a class='btn btn-light' data-btn='remove'>案内消し<a>";
	code = code+"<a class='btn btn-light' data-btn='save'>*保存<a>";
	
	code = code+"</td><td class='nowrap' id='sum'>0</td></tr>";
	return code;
};

var makeButtonHTML = function(itemName, gradingList) {

	var code = "<tr><td class='nowrap'>"+itemName+"</td><td>";
	
	$.each( gradingList, function(i, j){
		code = code+"<a onclick='openControl(this);' class='btn btn-light' id='"+getUniqueId()+"' value='"+j+"'>"+i+"</a>";
	});

	// 初期点数を指定
	code = code+"</td><td class='nowrap'>0</td></tr>";

	return code;
};

var openControl = function(elem) {
	$('#control').dialog('open');
	openControlElements = elem;
};

var control = function(status) {

	// 親要素を取得
	var parent = openControlElements.parentNode;

	// 右の要素（点数）を取得
	var scoa = parseInt($(parent).next().text());
	
	// 合計点数の取得
	var sumElem = document.getElementById("sum");
	var sumScoa = parseInt($(sumElem).text());	

	// 項目に設定されている値を取得
	var point = parseInt($(openControlElements).attr("value"));

	switch(status){
		case 'success':
			// 既存のボタンが成功でない場合
			if (!$(openControlElements).hasClass('btn-success')) {
				// 現在のスコアに加算
				scoa = scoa + point;
				sumScoa = sumScoa + point;
			}
			$(openControlElements).removeClass("btn-light");
			$(openControlElements).removeClass("btn-error");
			$(openControlElements).addClass("btn-success");
			
			if ($(parent).prev().text()=='レスキューキット') {
				$('#'+rescueKitId).trigger("click");
			}
			
			if ($(parent).prev().text()=='被災者') {
				$('#'+rescueId).trigger("click");
			}
			
		break;
		case 'error':
			// 既存のボタンが成功であった場合
			if ($(openControlElements).hasClass('btn-success')) {
				// 現在のスコアから減点
				scoa = scoa - point;
				sumScoa = sumScoa - point;
			}
			$(openControlElements).removeClass("btn-light");
			$(openControlElements).removeClass("btn-success");
			$(openControlElements).addClass("btn-error");
			

			if ('レスキューキット'!=$(parent).prev().text() || '被災者'!=$(parent).prev().text() ) {
				// 強制的に競技進行の停止をカウント
				$('#'+stopOfTheCompetitionProgressId).trigger("click");
			}
		break;
		case 'light':
			// 既存のボタンが成功であった場合
			if ($(openControlElements).hasClass('btn-success')) {
				// 現在のスコアを減点
				scoa = scoa - point;
				sumScoa = sumScoa - point;
			}
			$(openControlElements).removeClass("btn-success");
			$(openControlElements).removeClass("btn-error");
			$(openControlElements).addClass("btn-light");
		break;
	}
	
	// 右の要素（点数）を指定
	$(parent).next().text(scoa);
	scoaArray[$(parent).prev().text()] = scoa;
	
	// 合計点数の設定
	$(sumElem).text(sumScoa);
	scoaArray['合計'] = sumScoa;

	
	var itemId = $(openControlElements).attr("id");

	chatSocket.emit("scoaData", {team:scoaArray['チーム名'], itemId:itemId, status:status, unit:point, scoa:scoa});
	chatSocket.emit("sumScoa", {team:scoaArray['チーム名'], sumScoa:sumScoa});

	$('#control').dialog('close');

	/* ---- */
	
	switch(status) {
		case 'success':
			guideSocket.emit("guide", {msg:$(parent).prev().text()+"の成功によって、"+point+"点　追加ポイントです。", color:'blue'});
			break;
		case 'error':
			guideSocket.emit("guide", {msg:$(parent).prev().text()+"の失敗です。", color:'red'});
			break;
	}
	guideSocket.emit("info", {'大会名':scoaArray['大会名'], 'チーム名':scoaArray['チーム名'], 'field':scoaArray['field'],'合計':scoaArray['合計']});
};


/* -- -- */

chatSocket.on("connect", function () {
	console.log("サーバに接続しました。");
});


$(document).ready(function() {

	scoaArray = makeScoaArray(itemArray);

    $('#control').dialog({
        autoOpen: false,
		resizable: false,
        height: 120,
        width: 460,
    });
    $('#exitPanel').dialog({
        autoOpen: false,
		resizable: false,
        height: 170,
        width: 360,
    });
	addLines(itemArray);
	$('#scoaTable').append(makeSumHTML());

	guideSocket.emit("start");
	guideSocket.emit("clear");


	guideSocket.emit("info", {'大会名':scoaArray['大会名'], 'チーム名':scoaArray['チーム名'], 'field':scoaArray['field'],'合計':scoaArray['合計']});

});