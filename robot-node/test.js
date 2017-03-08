
var util = require('util');
var events = require('events');
var API = require('./https-helper.js');
var BingSTTAPI = require('./bing-stt-wrapper.js');
var uuid = require('node-uuid');

var ALSARecord = require('./node-arecord.js');
var ALSAPlay = require('./node-aplay.js');

var api = new BingSTTAPI();
var APPID = uuid.v1();
var STT_TOKEN = '';
var tokenAccquired = false;
var index = 0;

        api.accquireToken('84517151739b4a4f83ea1ce042cc348c',
                function(data){
                    STT_TOKEN = data;
                    tokenAccquired = true;
                    console.log('token='+STT_TOKEN);
                    api.speechToText(STT_TOKEN, '/tmp/temp_0.wav' , APPID,
                                    function(data){
                                        console.log('[user]' + data);
                                    },
                                    function(error){
                                        console.log('[Error]' + error);
                                    });
                },
                function(error){
                    tokenAccquired = true;
                });
        
var index = 0;
console.log('test');

process.stdin.on('data', function (text) {
    console.log('received data:', util.inspect(text));
    if (text === 'quit\n') {
      done();
    }
  });

return;








