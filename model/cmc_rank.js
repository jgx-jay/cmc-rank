var Mongoose = require('../lib/mongoose')();

var CmcRankSchema = new Mongoose.Schema({
  uid: {type: Number},
  name: {type: String},
  data: {type: String},
  time: {type: String}
}, {collection: 'CmcRank'});

var model = Mongoose.model('CmcRank', CmcRankSchema);

module.exports = model;