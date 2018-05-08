var Mongoose = require('../lib/mongoose')();

var CoinDescSchema = new Mongoose.Schema({
  name: {type: String},
  name_zh: {type: String},
  symbol: {type: String},
  description: {type: String},
  twitter: {type: String},
  website_url: {type: String},
  white_paper_link: {type: String},
  total_coin_supply: {type: String},
  start_date: {type: String},
  description_zh: {type: String},
  created_at: {type: Date, default: Date.now}
}, {
  collection: 'CoinDescription'
});

var model = Mongoose.model('CoinDescription', CoinDescSchema);

module.exports = model;