var helper = require(__dirname + '/../helper');

module.exports = {


	/**
	 * GET - ロボットリストの取得
	 */
	find: function (req, res) {

		helper.db().query('SELECT * FROM robot;', function(err, rows, fields) {

			if (err) {
				res.status(500).send(err.toString());
				return;
			}

			res.send(rows);

		});

	},


	/**
	 * GET - ロボットの取得
	 */
	findById: function (req, res) {

		var id = req.params.id;
		if (id == null) {
			res.status(400).send('id parameter is required.');
			return;
		}

		helper.db().query('SELECT * FROM robot WHERE id = ?;', [id], function(err, rows, fields) {

			if (err) {
				res.status(500).send(err.toString());
				return;
			}

			if (rows.length <= 0) {
				res.status(404).send('Could not find item.');
				return;
			}

			res.send(rows[0]);

		});

	},


	/**
	 * GET - ロボットの作成
	 */
	create: function (req, res) {

		helper.db().query('INSERT INTO robot SET ?', req.body, function (err, result) {

			if (err) {
				res.status(500).send(err.toString());
				return;
			}

			res.send({
				id: result.insertId
			});

		});

	},


	/**
	 * GET - ロボットの作成
	 */
	update: function (req, res) {

		var id = req.params.id;
		if (id == null) {
			res.status(400).send('id parameter is required.');
			return;
		}

		helper.db().query('UPDATE robot SET ? WHERE id = ?', [req.body, id], function (err, result) {

			if (err) {
				res.status(500).send(err.toString());
				return;
			}

			res.send('Updated ' + result.affectedRows + ' items.');

		});

	},


	/**
	 * DELETE - ロボットの削除
	 */
	delete: function (req, res) {

		var id = req.params.id;
		if (id == null) {
			res.status(400).send('id parameter is required.');
		}

		helper.db().query('DELETE FROM robot WHERE id = ?;', [id], function(err, result) {

			if (err) {
				res.status(500).send(err.toString());
				return;
			}

			res.send('Deleted ' + result.affectedRows + ' items.');

		});

	}


};
