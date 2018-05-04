var request = require('co-request');
var cheerio = require('cheerio');
var MysqlLib = require('../lib/mysql-lib');
var schedule = require('node-schedule');
var co = require('co');
var CmcModel = require('../model/cmc_rank');

// var db = new MysqlLib();

schedule.scheduleJob('00  */5  *  *  *  *', function () { 
  co(function *() {

    try {
      var cacheData = JSON.stringify(yield getNewData());

      var conditions = {name: 'cmc_rank'};
 
      var update = {$set: {
        data: cacheData,
        time: new Date()
      }};
      
      CmcModel.update(conditions, update, function(error) {
          if(error) {
              console.log(error);
          } else {
              console.log('Update success!');
          }
      });

      /*
      var id = yield db.insertAsync(
          'insert into cmc set cache_data = ?, last_update_at = now()',
          [cacheData]
      )
      */

    } catch(err) {
      console.log('failed ' + err.message);
    }
  });
});


function getNewData() {

  function getResponseBody (url) {
    return new Promise(async (resolve, reject) => {
      var headers = {};

      headers.UserAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1';

      var resp = await request({
          'url': url,
          'headers': headers
      });

      resolve(resp.body);

    });
  }

  return getResponseBody('https://coinmarketcap.com/').then((bodyStr) => {
      var result = [];

      $ = cheerio.load(bodyStr);
      $('#currencies').find('tr').map((i, el) => {

        let name = $(el).find('.currency-name').find('a').text()
        let marketCap = $(el).find('.market-cap').attr('data-usd')
        let price = $(el).find('.price').attr('data-usd')
        let volume = $(el).find('.volume').attr('data-usd')
        let circulatingSupply = $(el).find('.circulating-supply').find('a').attr('data-supply')
        let change = $(el).find('.percent-change').attr('data-percentusd')
        
        if (!name) return;
        
        result.push({
            name,
            marketCap,
            price,
            volume,
            circulatingSupply,
            change
        });
      });

      return result;
  })

}



