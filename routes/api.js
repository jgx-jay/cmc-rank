var router = require('koa-router')();

router.get('/', function *(next) {
  this.body = 'hello world';
});

router.get('/get_cmc_rank', function *(next) {

  var result = yield require('../api/get_cmc_rank')();
  this.body = JSON.stringify(result, null, 2);
  
});



module.exports = router;
