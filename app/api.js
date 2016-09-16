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
		// prefs.vk_ts = 1854433975;
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
	  		// seems like longpoll's data has already died, now we need to use longPollHistory..
	  		apiRequest('messages.getLongPollHistory', utils.urify({'ts':prefs.vk_ts, 'pts':prefs.vk_pts}), longpollHistory);
	  	} else {
	  		// longpoll still alive! Lets fetch it's data now!1
	  		updates = body.updates;
	  		for (i=0; i<updates.length; i++) {
	  			update = updates[i];
	  			console.log(update);
	  			if (update[0] == 4 && update[2] != 3) {
	  				sendMessage(update[3], 'pong');
	  			}
	  			//sendMessage(uid, 'pong');
	  		}
	  		longpoll(server, key, body.ts);
	  	}

	  	prefs.vk_ts = body.ts;
	  	prefs.vk_server = server;
	  	prefs.vk_key = key;
	  }
	})
}

function longpollHistory(resp) {
	sorryUIDs = [];
	response = resp.response;
	if (response.hasOwnProperty('history')) {
		messages = response.messages.items;
		for (i=0; i<messages.length; i++) {
			message = messages[i];
			if (message.out == 0) {
				sorryUIDs.push(message.user_id);
			}
		}

		console.log("ES 6 test");


		console.log(sorryUIDs)

		sorryUIDsUniq = Array.from(new Set(sorryUIDs));

		console.log(sorryUIDsUniq)

		for(i=0; i<sorryUIDsUniq.length; i++) {
			sendMessage(sorryUIDsUniq[i], 'Бот немного приболел и был недоступен.. Но! Теперь он снова здоров и готов ответить на все интересующие тебя вопросы. Спрашивай :)');
		}

		//if (response.more == 1)
		prefs.vk_pts = response.new_pts;
		if (response.more == 1) {
			apiRequest('messages.getLongPollHistory', utils.urify({'ts':prefs.vk_ts, 'pts':response.new_pts}), longpollHistory);
		} else {
			apiRequest('messages.getLongPollServer', utils.urify({'need_pts':1}), startLongpoll);
		}
	}
}

/* send message */

function sendMessage(uid, msg) {
	apiRequest('messages.send', utils.urify({'user_id':uid, 'message':msg}), sendMessageCallback);
}

function sendMessageCallback(resp) {
	console.log(resp);
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
	  		console.log("[apiRequest]:");
	  		console.log(body)
	  	} else {
	  		//console.log(body);
	  		callback(body);
	  	}
	  }
	})
}