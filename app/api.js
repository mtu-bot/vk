/* modules */ 
const request = require('request');
const config = require('config');
const preferences = require("preferences");
const utils = require('./utils.js');

//.. 

/* vars */
const accessToken = config.get('vk.access_token');
const version = config.get('vk.version');
const prefs = new preferences('me.tehcpu.vkbot1');

//.. 

// DEBUG

// 1854433975 <--- debug ts (4:48pm 15.09.16)


//console.log(apiRequest('messages.getLongPollServer', utils.urify({'need_pts':1}), startLongpoll));

//..

/******************/
/* COMMON SECTION */
/******************/

/* start */

wakeup();

function wakeup() {
	// boot
	if (prefs.vk_pts === undefined || prefs.vk_ts === undefined) {
		// oh, looks like it's our first time :) We must to get pts (for longpollhistory method) and other needle data for lp.
		apiRequest('messages.getLongPollServer', utils.urify({'need_pts':1}), startLongpoll);
	} else {
		// now we have all data for lp. yay +_*
		prefs.vk_ts = 1854433975;
		longpoll(prefs.vk_server, prefs.vk_key, prefs.vk_ts);
	}
}

/* longpoll */

function longpoll(server, key, ts) {
	request('https://'+server+'?act=a_check&key='+key+'&ts='+ts+'&wait=25&mode=2', function (error, response, body) {
	  if (!error && response.statusCode == 200) {
	  	body = JSON.parse(body);
	  	console.log(body) // @todo: remove this line!
	  	
	  	if (body.hasOwnProperty('failed')) {
	  		console.log("msg limit");
	  	}
	  	//
	  	longpoll(server, key, body.ts);

	  	prefs.vk_ts = body.ts;
	  	prefs.vk_server = server;
	  	prefs.vk_key = key;
	  }
	})
}

/* needle callbacks */

function startLongpoll(resp) {
	prefs.vk_pts = resp.response.pts;
	longpoll(resp.response.server, resp.response.key, resp.response.ts);
}

function apiRequest(method, params, callback) {
	request('https://api.vk.com/method/'+method+'?'+params+'&access_token='+accessToken+'&v='+version, function (error, response, body) {
	  if (!error && response.statusCode == 200) {
	  	body = JSON.parse(body);
	  	console.log(body)
	  	if (body.hasOwnProperty('error')) {
	  		//console.log(body);
	  	} else {
	  		//console.log(body);
	  		callback(body);
	  	}
	  }
	})
}