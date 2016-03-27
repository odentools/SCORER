/***********************
 * 全般共通jsファイルguide
 ***********************/

/* サーバのホストアドレスを取得 */
var getServerAddress = function() {
	return location.host.split(":")[0];
};



/* ------------------ */



// サーバーのホストアドレスを取得する
var SERVER_ADDRESS = location.host.split(":")[0];

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
				$('#scoaTable').append(makeCountHTML(gradingList));
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

var makeCountHTML = function(gradingList) {

	// カウントの場合は連想配列は絶対1つにする事.
	if (getAssociationLength(gradingList) != 1) {
		return "<tr><td></td><td>項目設定の構文エラーです。<br>カウントの場合は連想配列を1つにして下さい。</td><td></td></tr>";
	}

	var code;

	$.each( gradingList, function(i, j){
		
		if (i=='競技進行の停止') {
			stopOfTheCompetitionProgressId = "scoringItem_" + uniqueIdNumber;
		}
		
		if (i=='被災者数') {
			rescueId = "scoringItem_" + uniqueIdNumber;
		}
		
		if (i=='レスキューキット数') {
			rescueKitId = "scoringItem_" + uniqueIdNumber;
		}
		console.log(rescueId);
		

		code = "<tr><td class='nowrap'>"+i+"</td><td>";

		code = code+"<table class='inner'><tr>";
	
		code = code+"<td><a onclick='addCount(this, 0);' class='btn btn-empty btn-success' id='"+getUniqueId()+"' value='"+j+"'>＋</a></td>";
		code = code+"<td>回数 <span class='countBold'>0<span></td>";
		code = code+"<td><a onclick='addCount(this, 1);' class='btn btn-empty btn-warning' id='"+getUniqueId()+"' value='"+j+"'>－</a></td>";

		code = code+"</tr></table>";

		// 初期点数を指定
		code = code+"</td><td class='nowrap'>0</td></tr>";

	});

	return code;

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

var addCount = function(elem, allowance) {

	var count, oldcount;

	// 合計点数の取得
	var sumElem = document.getElementById("sum");
	var sumScoa = parseInt($(sumElem).text());	

	// 親要素を取得
	var parent = elem.parentNode;
	
	// 項目に設定されている値を取得
	var point = parseInt($(elem).attr("value"));

	switch(allowance) {
		case 0:	// 左のボタン
			// 右の要素（点数）を取得
			oldcount = count = parseInt($(parent).next().children("span").text());
			count++;
			$(parent).next().children("span").text(count);
			break;
		case 1:	// 右のボタン
			// 左の要素（点数）を取得
			oldcount = count = parseInt($(parent).prev().children("span").text());
			// 負のカウントを防止
			if (count > 0) {
				count--;
				$(parent).prev().children("span").text(count);
			}
		break;
	}
	
	var scoa = point*count;

	// 点数の設定
	$(parent).parent().parent().parent().parent().next().text(scoa);
	scoaArray[$(parent).parent().parent().parent().parent().prev().text()] = {scoa:scoa, count:count};// これは上とフォーマット合してね

	sumScoa = sumScoa - point*oldcount;
	sumScoa = sumScoa + scoa;

	// 合計点数の設定
	$(sumElem).text(sumScoa);
	scoaArray['合計'] = sumScoa;

	var itemId = $(elem).attr("id");
	chatSocket.emit("scoaData", {team:scoaArray['チーム名'], itemId:itemId, allowance:allowance, unit:point, scoa:scoa, count:count});
	chatSocket.emit("sumScoa", {team:scoaArray['チーム名'], sumScoa:sumScoa});

	/* ---- */
	
	if($(parent).parent().parent().parent().parent().prev().text() == '競技進行の停止') {
		guideSocket.emit("guide", {msg:"競技進行の停止のカウント、"+count+"回目です。", color:'red'});
	} else if(allowance == 0) {
		if(point>0) {
			guideSocket.emit("guide", {msg:$(parent).parent().parent().parent().parent().prev().text()+" "+count+"回目です。追加"+point+"点です。", color:'blue'});
		}
	}
	guideSocket.emit("info", {'大会名':scoaArray['大会名'], 'チーム名':scoaArray['チーム名'], 'field':scoaArray['field'],'合計':scoaArray['合計']});
};


/* -- -- */
chatSocket.on("connect", function () {
	console.log("サーバに接続しました。");
});

/*
chatSocket.on("message", function (message) {
	console.log(message);
});
*/

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