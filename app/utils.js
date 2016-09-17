// common utils
module.exports = {
  urify: function (data) {
    return Object.keys(data).map(function(key){ 
      return encodeURIComponent(key) + '=' + encodeURIComponent(data[key]); 
    }).join('&');
  },
  logcat: function (msg, log) {
    var now     = new Date(); 
    var year    = now.getFullYear();
    var month   = now.getMonth()+1; 
    var day     = now.getDate();
    var hour    = now.getHours();
    var minute  = now.getMinutes();
    var second  = now.getSeconds(); 
    if(month.toString().length == 1) {
        var month = '0'+month;
    }
    if(day.toString().length == 1) {
        var day = '0'+day;
    }   
    if(hour.toString().length == 1) {
        var hour = '0'+hour;
    }
    if(minute.toString().length == 1) {
        var minute = '0'+minute;
    }
    if(second.toString().length == 1) {
        var second = '0'+second;
    }   
    dateTime = year+'/'+month+'/'+day+' '+hour+':'+minute+':'+second;   

  	console.log('['+dateTime+'] '+msg);
  		console.log(log);
  }
}