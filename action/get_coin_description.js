var request = require('co-request');
var co = require('co');
var Model = require('../model/coin_description');
var cheerio = require('cheerio');

co(function *() {
	try {
		yield main();
	} catch(err) {
		console.error(err);
  }
  
	process.exit(0);
});

function *main() {

  var list = yield getOriginRelatedAllWord();

  for (let i = 0; i < list.length; i++) {
    const li = list[i];

    var arr = li.split('#') || [];

    if (!arr.length) continue;
  

    var name = '',
        name_zh = '',
        symbol = '',
        description_zh = '';

    if (+arr[0]) {
      name_zh = arr[2];      
      name = arr[3];
      description_zh = yield getOriginDesc(arr[1]) || '';
      console.log(arr);
    } else {
      name = arr[2];
      name_zh = arr[3];
      symbol = arr[4];
      description_zh = yield getOriginDesc(arr[1]) || '';
    }

    // 重置
    // yield Model.update({
    //     name: name_zh
    //   }, {
    //     $set: {
    //       name: name,
    //       name_zh: name_zh
    //     }
    //   }
    // )
    
    var res = yield Model.create({
      "name": name,
      "name_zh": name_zh,
      "symbol": symbol,
      "description_zh": description_zh
    }, (err, docs) => {
      if (err) {
        console.log(err);
      } else {
        console.log('done :' + i);
      }
    })
  }

  return;
}

function getOriginRelatedAllWord () {
  var url = 'https://api.feixiaohao.com/search/relatedallword';

  return new Promise(async (resolve, reject) => {
    var resp = await request({
        'url': url,
    });

    resolve(resp.body);

  }).then(result => {
    return JSON.parse(result);
  })
}

function getOriginDesc(name) {

  var url = `https://www.feixiaohao.com/coindetails/${name}/`;
  // var url = 'https://www.feixiaohao.com/coindetails/Steem/';
  var headers = {};
  headers.UserAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1';

  return new Promise(async (resolve, reject) => {
    var resp = await request({
        'url': url,
        'headers': headers
    });

    resolve(resp.body);

  }).then(bodyStr => {

    $ = cheerio.load(bodyStr);
    var desc = $('.artBox').text();
    
    return desc || '';
  }).catch(error => console.log('faild', error));
}
