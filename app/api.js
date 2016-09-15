/* modules */ 
const request = require('request');
const config = require('config');
const preferences = require("preferences");
const utils = require('./utils.js');

//.. 

/* vars */
const accessToken = config.get('vk.access_token');
const version = config.get('vk.version');
const prefs = new preferences('me.tehcpu.mtuvkbot');

//.. 

// DEBUG
 
//console.log(prefs.vk_pts);
//console.log(accessToken);

//console.log(utils.urify({'key':'val', 'key2':'val2'}))

console.log(apiRequest('messages.getLongPollServer', {'need_pts': 1}, startLongpoll));

//..

/******************/
/* COMMON SECTION */
/******************/

/* longpoll */

function longpoll(server, key, ts) {
	console.log('qweqwe lp');
}

/* needle callbacks */

function startLongpoll(response) {
	longpoll();
}

function apiRequest(method, params, callback) {
request('https://api.vk.com/method/'+method+'?access_token='+accessToken+'&v='+version, function (error, response, body) {
  if (!error && response.statusCode == 200) {
    callback(body);
  }
})

}