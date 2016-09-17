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

/* bot vars */
const keysets = [["привет", "хей", "hi", "hey", "дратути", "здарова"], ["как", "дела", "чекаво"], ["пока", "бай", "bye", "досвидули"]];
const responses = ["привет :)", "норм", "пока (◕‿◕)"];

//..

/******************/
/* COMMON SECTION */
/******************/

/* start */

wakeup();

//botResolver("привет");

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

/*********************/
/* BOT LOGIC SECTION */
/*********************/

function botResolver(message) {
	//message = "привет пока досвидули азаз,ваолвыа ,sadasdk kasjf,!sdkna #$56 иу-7";
	message = message.replace(/[^\wа-я\s]/gi, ' ');
	message = message.replace("  ", ' ');
	words = message.split(" ");

	matchingIndex = [];

	for (i=0; i<keysets.length; i++) {
		matchingIndex[i] = 0;
		keyset = keysets[i];
		for (j=0; j<keyset.length; j++) {
			key = keyset[j];
			for (k=0; k<words.length; k++) {
				word = words[k];
				if (key == word) {
					matchingIndex[i] += 1;
				}
			}
		}
	}

	return responses[matchingIndex.indexOf(Math.max.apply(null, matchingIndex))];

}

/***************/
/* API SECTION */
/***************/

/* longpoll */

function longpoll(server, key, ts) {
	request('https://'+server+'?act=a_check&key='+key+'&ts='+ts+'&wait=25&mode=2', function (error, response, body) {
	  if (!error && response.statusCode == 200) {
	  	body = JSON.parse(body);

	  	utils.logcat("longpoll beat", body);
	  	
	  	if (body.hasOwnProperty('failed')) {
	  		// seems like longpoll's data has already died, now we need to use longPollHistory..
	  		apiRequest('messages.getLongPollHistory', utils.urify({'ts':prefs.vk_ts, 'pts':prefs.vk_pts}), longpollHistory);
	  	} else {
	  		// longpoll still alive! Lets fetch it's data now!1
	  		updates = body.updates;
	  		// look through all updates ..
	  		for (i=0; i<updates.length; i++) {
	  			update = updates[i];
	  			// .. and find only incoming messages.
	  			if (update[0] == 4 && update[2] != 3) {
	  				// send response
	  				sendMessage(update[3], botResolver(update[6]));
	  			}
	  		}
	  		// and initiate new longpoll beat
	  		longpoll(server, key, body.ts);
	  	}

	  	// redefine lp vars
	  	prefs.vk_ts = body.ts;
	  	prefs.vk_server = server;
	  	prefs.vk_key = key;

	  }
	})
}

function longpollHistory(resp) {
	// in case when bot down a lot of time, we must to send
	// take-back message for users who wants to talk.
	sorryUIDs = [];
	response = resp.response;
	if (response.hasOwnProperty('history')) {
		messages = response.messages.items;
		// getting uids for delivery
		for (i=0; i<messages.length; i++) {
			message = messages[i];
			if (message.out == 0) {
				sorryUIDs.push(message.user_id);
			}
		}

		sorryUIDsUniq = Array.from(new Set(sorryUIDs));

		for(i=0; i<sorryUIDsUniq.length; i++) {
			sendMessage(sorryUIDsUniq[i], 'Бот немного приболел и был недоступен.. Но! Теперь он готов ответить на все интересующие тебя вопросы. Спрашивай :)');
		}

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
	// console.log(resp);
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
	  	if (body.hasOwnProperty('error')) {
	  		utils.logcat("apiRequest error!! See it below!", body);
	  	} else {
	  		callback(body);
	  	}
	  }
	})
}