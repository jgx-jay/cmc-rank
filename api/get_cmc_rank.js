// var MysqlLib = require('../lib/mysql-lib');
var CmcModel = require('../model/cmc_rank');

module.exports = function *() {
  // var db = new MysqlLib();

  var result = {
    'status': 0,
    'data': {
      'list': []
    }
  };


  var dbRow = yield CmcModel.findOne({
    'name': 'cmc_rank'
  }, function (error, docs) {
    if(error) {
        console.log(error);
    }
  });

  if (dbRow) {
    result.status = 1;
    result.data.list = JSON.parse(dbRow.data);
  }

  /*
  var row = yield db.selectOneAsync(
    'select * from cmc order by id desc limit 1'
  );

  if (row) {
    result.status = 1;
    result.data.list = JSON.parse(row.cache_data);
  }
  */

  return result;
}