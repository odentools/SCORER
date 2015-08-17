var mysql	= require('mysql');

module.exports = {

	/**
	 * データベース接続の初期化
	 * @return {Connection} MySQL DB connection
	 */
	db: function () {

		var connection	= mysql.createConnection({
			host     : 'chloringoame17.dip.jp',
			user     : 'oden',
			password : 'Oden-1218',
			port     : 993,
			database : 'robocup'
		});
		return connection;

	}

};
