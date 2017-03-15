
var util = require('util');
var events = require('events');
var API = require('../https-helper.js');
var BingSTTAPI = require('../bing-stt-wrapper.js');
var uuid = require('node-uuid');
var fs = require("fs");

var ALSARecord = require('../node-arecord.js');
var ALSAPlay = require('../node-aplay.js');
/*
var ps = require('../stt/node/node-pocketsphinx/').ps;
var modeldir = "../stt/pocketsphinx/model/en-us/";
var lmdir = "../stt/node/node-pocketsphinx/supports/";
*/
var api = new BingSTTAPI();

var APPID = uuid.v1();
var STT_TOKEN = '';
var tokenAccquired = false;
var index = 0;

var BOTWRAPPER = require('../botclient.js');
var bot = new BOTWRAPPER();

var BOT_DIRECTLINE_KEY = 'X-O-skejDE0.cwA.n0k.PX7roOwYzPtkqr50ClLjRRBhz3v0e0rIYLgz7fXZjL4';

/*
var config = new ps.Decoder.defaultConfig();
config.setString("-hmm", modeldir + "en-us");
config.setString("-dict", modeldir + "cmudict-en-us.dict");
config.setString("-lm", modeldir + "en-us.lm.bin");
var decoder = new ps.Decoder(config);
*/
/*

var config = new ps.Decoder.defaultConfig();
config.setString("-hmm", modeldir + "en-us");
config.setString("-dict", lmdir + "4421.dict");
config.setString("-lm", lmdir + "4421.bin");
var decoder = new ps.Decoder(config);
*/
function StartRecord(folder, prefix){
    var fn = prefix + index + '.wav';
    var sound = new ALSARecord({
        debug: true,    // Show stdout 
        destination_folder: folder,
        filename: fn,
        //alsa_format: 'cd',
        alsa_rate:16000,
        alsa_device: 'plughw:1,0'
        //alsa_rate: 44000
    }); 
    sound.record();
    //setTimeout(function () {
    //    sound.pause(); // pause the recording after five seconds 
    //}, 5000);
    
    //setTimeout(function () {
    //    sound.resume(); // and resume it two seconds after pausing 
    //}, 7000);
    
    setTimeout(function () {
            console.log('stop recording!');
            sound.stop(); // stop after ten seconds 
        }, 2000);
    // you can also listen for various callbacks: 
    sound.on('complete', function () {
        api.speechToText(STT_TOKEN, folder + fn , APPID, 'en-US',
                                        function(sttText){
                                            /*
                                            {
                                                "version":"3.0",
                                                "header":
                                                    {
                                                        "status":"success",
                                                        "scenario":"websearch",
                                                        "name":"123",
                                                        "lexical":"one two three",
                                                        "properties":{"requestid":"19542ef3-77d4-4fe6-b329-81c70d9f9ce6","HIGHCONF":"1"}},"results":[{"scenario":"websearch","name":"123","lexical":"one two three","confidence":"0.915499","properties":{"HIGHCONF":"1"}}]}
                                            */
                                            console.log('[user]' + sttText);
                                            var sttResult = JSON.parse(sttText);
                                            if(sttResult.header.status !='success'){
                                                console.log('STT failed:' + sttResult.header.status);
                                            }
                                            else
                                            {
                                                //send to bot
                                                bot.setDirectlineSecret(BOT_DIRECTLINE_KEY);
                                                bot.accquireToken(function(data){
                                                        var result = bot.startConversation(function(data){
                                                            console.log('***** message recevied from bot = ' + JSON.stringify(data));
                                                        });
                                                        convId = result.conversationId;
                                                        var userText = sttResult.header.lexical;
                                                        bot.sendMessage(result.conversationId,'user1',userText);
                                                    },
                                                    function(error){
                                                        console.log('error=' + error);
                                                    }
                                                );
                                            }
                                            //play response
                                            //record again
                                            //StartRecord(folder, prefix, ++index);
                                        },
                                        function(error){
                                            console.log('[Error]' + error);
                                        });

    });
}
api.setSubscriptionKey('84517151739b4a4f83ea1ce042cc348c');
api.accquireToken(function(data){
                    STT_TOKEN = data;
                    tokenAccquired = true;
                    //while(STT_TOKEN != ''){
                        console.log('token='+STT_TOKEN);
                        StartRecord('/tmp/','temp_');
                    //};
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