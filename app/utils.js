// common utils
module.exports = {
  urify: function (data) {
    return Object.keys(data).map(function(key){ 
      return encodeURIComponent(key) + '=' + encodeURIComponent(data[key]); 
    }).join('&');
  }
}