var express = require('express');
var googlehome = require('./google-home-notifier');
var ngrok = require('ngrok');
var bodyParser = require('body-parser');
var app = express();
const serverPort = 8080;

var deviceName = 'Google Home';
googlehome.device(deviceName);

var urlencodedParser = bodyParser.urlencoded({ extended: false });

app.post('/google-home-notifier', urlencodedParser, function (req, res) {
  if (!req.body) return res.sendStatus(400)
  console.log(req.body);
  var text = req.body.text;
  var lang = req.body.lang;
  var audio = req.body.audio || "en";
  if (text){

    res.send(deviceName + ' will say: ' + text + ' in ' + lang +'\n');
    googlehome.notify(text, lang, function(res) {
      console.log(res);
    });
  } 
else if (audio){
    res.send(deviceName + ' will play: ' + audio + '\n');
    googlehome.play(audio, function(res) {
      console.log(res);
    });
  }else{
    res.send('Please POST "text=Hello Google Home" or "audio=mp3file_url"');
  }

})

app.listen(serverPort, function () {
var url = "http://localhost";
  //ngrok.connect(serverPort, function (err, url) {
    console.log('POST "text=Hello Google Home" to:');
    console.log('    http://localhost:' + serverPort + '/google-home-notifier');
    console.log('    ' +url + '/google-home-notifier');
    console.log('example:');
    console.log('curl -X POST -d "text=Hello Google Home" ' + url + '/google-home-notifier');
  //});
})
