var mysql = require('mysql');
var mysqlWrapper = require('co-mysql');

/**
 * @param {Object} config
 * @constructor
 */
function MysqlLib(config) {
	var mysqlPool = mysql.createPool({
		  host: '101.201.48.74',
		  port: '3306',
		  user: 'test_ptbb',
		  password: '6839bbae6f71d7b5e059e90cac0f79a7',
		  database: 'ptbb',
		  connectionLimit: 50,
		  charset: 'utf8mb4_bin'
	});

	this.pool_ = mysqlWrapper(mysqlPool);

	this.costs_ = [];
	this.recordCosts_ = false;
}

/**
 * @param {string} sql
 * @param {Array=} args
 * @return {Object}
 */
MysqlLib.prototype.queryAsync = function *(sql, args) {
	if(!args) args = [];
	if(!(args instanceof Array)) {
		throw new Error('args should be an array');
	}

	sql = sql.trim();
	if(/^insert/i.test(sql)) {
	} else if(/^(select|show|desc)/i.test(sql)) {
	} else if(/^(update|delete)/i.test(sql)) {
		if(!/where/i.test(sql)) {
			// 不允许没有where的update和delete
			throw new Error('PTG sql update|delete need where sub-statement :<' + sql + '>');
		}
	} else {
		throw new Error('PTG unsupported sql statement: ' + sql);
	}

	for(var i = 0;i < args.length;i++) {
		var arg = args[i];
		if(arg === undefined ||
			typeof(arg) == 'number' && Number.isNaN(arg) ||
			arg === null
			) {
			throw new Error('PTG args[' + i + '] can not be undefined, nan or null: ' + sql); 
		}
	}

	var startAt = new Date();
	var ret = yield this.pool_.query(sql, args);
	var endAt = new Date();
	if(this.recordCosts_) {
		this.costs_.push({
			'sql': sql,
			'args': args,
			'at': startAt,
			'cost': (+endAt - +startAt) / 1000
		});
	}
	return ret;
};

/**
 * @param {string} sql
 * @param {Array=} args
 * @return {number}
 */
MysqlLib.prototype.insertAsync = function *(sql, args) {
	var ret = yield this.queryAsync(sql, args);
	if(!ret) return -1;
	return ret.insertId;
};

/**
 * @param {string} sql
 * @param {Array=} args
 * @return {number}
 */
MysqlLib.prototype.updateAsync = function *(sql, args) {
	var ret = yield this.queryAsync(sql, args);
	if(!ret) return 0;
	return ret.changedRows;
};

/**
 * @param {string} sql
 * @param {Array=} args
 * @return {Object}
 */
MysqlLib.prototype.selectOneAsync = function *(sql, args) {
	var rows = yield this.queryAsync(sql, args);
	if(!rows || rows.length == 0) return null;
	return rows[0];
};

/**
 * @param {string} sql
 * @param {Array=} args
 * @return {Array.<Object>}
 */
MysqlLib.prototype.selectAllAsync = function *(sql, args) {
	var rows = yield this.queryAsync(sql, args);
	if(!rows || rows.length == 0) return [];
	return rows;
};

MysqlLib.prototype.createSimpleQueryCollector = function (dbName, fn, extra) {
	var that = this;
	var vals = [];
	var cbs = [];

	if(!fn) fn = 'id';
	function SimpleQueryCollector() {
		this.add = function(val, cb) {
			vals.push(val);
			cbs.push(cb);
		};

		this.executeAsync = function *() {
			var rows = [];
			if(vals.length > 0) {
				var sql = 'select * from ' + dbName + ' where `' + fn + '` in ('+
					'"' + vals.join('","') + '") ';
				if(extra) {
					sql += ' and ' + extra;
				}

				rows = yield that.selectAllAsync(sql);
			}

			var set = {};
			rows.forEach(function(row) {
				set[row[fn]] = row;
			});

			for(var i = 0;i < vals.length;i++) {
				var row = set[vals[i]];
				if(cbs[i]) {
					cbs[i](row);
				}
			}

			// done
		}
	}

	return new SimpleQueryCollector();
};

module.exports = MysqlLib;

