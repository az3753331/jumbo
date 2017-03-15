
var util = require('util');
var events = require('events');
var API = require('./https-helper.js');
var BingSTTAPI = require('./bing-stt-wrapper.js');
var uuid = require('node-uuid');
var fs = require("fs");

var ALSARecord = require('./node-arecord.js');
var ALSAPlay = require('./node-aplay.js');

var ps = require('./stt/node/node-pocketsphinx/').ps;
var modeldir = "stt/pocketsphinx/model/en-us/";
var lmdir = "stt/node/node-pocketsphinx/supports/";

var api = new BingSTTAPI();

var APPID = uuid.v1();
var STT_TOKEN = '';
var tokenAccquired = false;
var index = 0;

var BOTWRAPPER = require('../botclient.js');


var bot = new BOTWRAPPER();
var BOT_DIRECTLINE_KEY = 'X-O-skejDE0.cwA.n0k.PX7roOwYzPtkqr50ClLjRRBhz3v0e0rIYLgz7fXZjL4';

var config = new ps.Decoder.defaultConfig();
config.setString("-hmm", modeldir + "en-us");
config.setString("-dict", modeldir + "cmudict-en-us.dict");
config.setString("-lm", modeldir + "en-us.lm.bin");
var decoder = new ps.Decoder(config);
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
        if(false)
        {
            console.log('Done with recording!=>' + folder + fn);
            fs.readFile(folder + fn, function(err, data) {
                console.log('read...');
                if (err) throw err;
                decoder.startUtt();
                decoder.processRaw(data, false, false);
                decoder.endUtt();
                var result = JSON.stringify( decoder.hyp() );
                console.log('PocketSphinx result=' + result);
                //if(result == "HI JUMBO"){
                    //trigger bot conversation anyway!

                //}
            });
        }
        else
        {
            api.speechToText(STT_TOKEN, folder + fn , APPID, 'en-Us',
                                        function(data){
                                            console.log('[user]' + data);
                                            //send to bot
                                            //play response
                                            //record again
                                            //StartRecord(folder, prefix, ++index);
                                        },
                                        function(error){
                                            console.log('[Error]' + error);
                                        });
        }
        
        /*                                
        var play = new ALSAPlay();
        play.play(fn);
        setTimeout(function () {
            play.pause(); // pause the music after five seconds
            }, 5000);

            setTimeout(function () {
            play.resume(); // and resume it two seconds after pausing
            }, 7000);

            // you can also listen for various callbacks:
            play.on('complete', function () {
            console.log('Done with playback!');
        });
        */
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