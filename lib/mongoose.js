const mongoose = require('mongoose');

module.exports = () => {
  var url = 'mongodb://127.0.0.1:27017/test';
  // mongoose.connect('mongodb://[username:password@]host1[:port1][,host2[:port2],...[,hostN[:portN]]][/[database][?options]]' [, options]);
  const db = mongoose.createConnection(url);
  db.Schema = mongoose.Schema;

  db.on('error', err => {
    err.message = `[egg-mongoose]${err.message}`;
    console.log(err);
  });

  db.on('disconnected', () => {
    console.log(`[egg-mongoose] ${url} disconnected`);
  });

  db.on('connected', () => {
    console.log(`[egg-mongoose] ${url} connected successfully`);
  });

  db.on('reconnected', () => {
    console.log(`[egg-mongoose] ${url} reconnected successfully`);
  });

  return db;
};