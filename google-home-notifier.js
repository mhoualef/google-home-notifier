var Client = require('castv2-client').Client;
var DefaultMediaReceiver = require('castv2-client').DefaultMediaReceiver;
var mdns = require('mdns');
var googletts = require('google-tts-api');
var browser = mdns.createBrowser(mdns.tcp('googlecast'));
var deviceAddress;
var device = function(name) {
    device = name;
    return this;
}

var notify = function(message, lang, callback) {
  if (!deviceAddress){
    browser.start();
    browser.on('serviceUp', function(service) {
      console.log('Device "%s" at %s:%d', service.name, service.addresses[0], service.port);
      if (service.name.includes(device.replace(' ', '-'))){
        deviceAddress = service.addresses[0];
        getSpeechUrl(message, lang, deviceAddress, function(res) {
          callback(res);
        });
      }
      browser.stop();
    });
  }else {
    getSpeechUrl(message, lang, deviceAddress, function(res) {
      callback(res);
    });
  }
}

var play = function(mp3_url, callback) {

console.log("play mp3_url : " + mp3_url); 

  if (!deviceAddress){
    browser.start();
    browser.on('serviceUp', function(service) {
      console.log('Device "%s" at %s:%d', service.name, service.addresses[0], service.port);
      if (service.name.includes(device.replace(' ', '-'))){
        deviceAddress = service.addresses[0];
    	onDeviceUp(deviceAddress, mp3_url, function(res){
      	callback(res)
    	});
      }
      browser.stop();
    });
  }else {
    onDeviceUp(deviceAddress, mp3_url, function(res){
      callback(res)
    });
  }
}

var getSpeechUrl = function(text, lang, host, callback) {
  googletts(text, lang, 1).then(function (url) {
    onDeviceUp(host, url, function(res){
      callback(res)
    });
  }).catch(function (err) {
    console.error(err.stack);
  });
}

var onDeviceUp = function(host, url, callback) {

console.log("onDeviceUp");
console.log("host",host);
console.log("url",url);

  var client = new Client();
  client.connect(host, function() {
    client.launch(DefaultMediaReceiver, function(err, player) {
      var media = {
        contentId: url,
        contentType: 'audio/mp3',
        streamType: 'BUFFERED', // or LIVE
      };
      player.load(media, { autoplay: true }, function(err, status) {
        client.close();
        callback('Device notified');
      });
    });
  });

  client.on('error', function(err) {
    console.log('Error: %s', err.message);
    client.close();
    callback('error');
  });
}

exports.device = device;
exports.notify = notify;
exports.play = play;
