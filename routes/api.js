var router = require('koa-router')();

router.get('/', function *(next) {

  // yield CmcModel(Mongoose).create({
  //   'name': 'cmc_rank',
  //   'data': JSON.stringify({
  //     'name': 'hahhaahah'
  //   }),
  //   'time': new Date()
  // }, function(error,doc) {
  //   if(error) {
  //       console.log(error);
  //   } else {
  //       console.log(doc);
  //   }
  // });

  
  this.body = 'hello world';
});

router.get('/get_cmc_rank', function *(next) {

  var result = yield require('../api/get_cmc_rank')();
  this.body = JSON.stringify(result, null, 2);
  
});



module.exports = router;
