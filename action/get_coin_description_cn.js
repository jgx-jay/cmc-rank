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

  var oUrl = 'https://www.cryptocompare.com/api/data/coinlist';
  var oUrlWithId = `https://www.cryptocompare.com/api/data/coinsnapshotfullbyid/?id=`;

  var oData = yield getOriginData(oUrl);

  var coinData = oData.Data;

  var dbDataList = yield Model.find({symbol: {$exists: true}});

  for (let i = 0; i < dbDataList.length; i++) {
    const element = dbDataList[i];

    var symbol = element.symbol.toLocaleUpperCase();

    if (coinData[symbol]) {

      var cDataDetail = yield getOriginData(oUrlWithId + coinData[symbol]['Id']);
      cDataDetail = cDataDetail['Data'];

      var generalData = cDataDetail['General'];
      var ICOData = cDataDetail['ICO'];

      var desc = generalData.Description.replace(/<[^>]+>/g,"");
      
      yield Model.update(
        {"symbol": {'$regex': symbol,'$options':'i'}}, 
        {$set: 
          {
            description: desc,
            start_date: generalData.StartDate || '',
            twitter: generalData.Twitter || '',
            website_url: generalData.WebsiteUrl || '',
            white_paper_link: ICOData.WhitePaperLink || '',
            total_coin_supply: generalData.TotalCoinSupply || ''
          }
        }
      );
      console.log('done: ' + i + ': ' + symbol)
    } else {
      console.log('no data: '+ element.symbol);
    }
    
  }

  // for (let i = 0; i < list.length; i++) {
  //   const li = list[i];

  //   var arr = li.split('#') || [];

  //   if (!arr.length) continue;
  
  //   var desc = yield getOriginDesc(arr[1]) || '';
    
  //   var symbol = arr.length == 6 ? symbol = arr[4] : '';
    
  //   var res = yield Model.create({
  //     "name": arr[2],
  //     "name_zh": arr[3],
  //     "symbol": symbol,
  //     "description_zh": desc
  //   }, (err, docs) => {
  //     if (err) {
  //       console.log(err);
  //     } else {
  //       console.log('done :' + i);
  //     }
  //   })
  // }
}

function getOriginData (url) {

  return new Promise(async (resolve, reject) => {
    var resp = await request({
        'url': url,
    });

    resolve(resp.body);

  }).then(result => {
    return JSON.parse(result);
  }).catch(error => console.log('faild', error));
}

