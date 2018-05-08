const mongoose = require('mongoose');

module.exports = () => {
  // var url = 'mongodb://127.0.0.1:27017/test';
  var url = 'mongodb://admin:gsN2z923nbvM2@118.89.147.176:27077/goldstone_db';
  // mongoose.connect('mongodb://[username:password@]host1[:port1][,host2[:port2],...[,hostN[:portN]]][/[database][?options]]' [, options]);
  const db = mongoose.createConnection(url, {auth:{authdb:'admin'}});
  db.Schema = mongoose.Schema;

  db.on('error', err => {
    err.message = `[mongoose]${err.message}`;
    console.log(err);
  });

  db.on('disconnected', () => {
    console.log(`[mongoose] ${url} disconnected`);
  });

  db.on('connected', () => {
    console.log(`[mongoose] ${url} connected successfully`);
  });

  db.on('reconnected', () => {
    console.log(`[mongoose] ${url} reconnected successfully`);
  });

  return db;
};