//                   __ _
//   ___ ___  _ __  / _(_) __ _
//  / __/ _ \| '_ \| |_| |/ _` |
// | (_| (_) | | | |  _| | (_| |
//  \___\___/|_| |_|_| |_|\__, |
//                         |___/

var debug = require('debug')('app:config');

if (!process.env.ENV || process.env.ENV == 'development') {
  var dotenv = require('dotenv').config({silent: true});
  console.log(`dotenv ENV: ${JSON.stringify(dotenv, 0, 2)}`);
}

const mongo = {
 name: 'MongoDB',
 connection: process.env.MONGO_CONNECTION
};

function configure(configuration) {
 for (var key in configuration) {
   var config = configuration[key];
  // if its missing, bail
   if (!config) {
     var error = new Error(`Could not configure ${configuration.name}. Missing ${key}`);
     debug(error);
     throw error;
   }
 }
 return configuration;
}

exports.db = configure(mongo);
