
var util = require('util');
var events = require('events');
var API = require('./https-helper.js');
var BingSTTAPI = require('./bing-stt-wrapper.js');

var ALSARecord = require('./node-arecord.js');
var ALSAPlay = require('./node-aplay.js');

var api = new BingSTTAPI();
var APPID = 'bot-test';
var STT_TOKEN = '';
var tokenAccquired = false;
/*
let Mic = require('node-microphone');
let mic = new Mic();
let micStream = mic.startRecording();
micStream.pipe( myWritableStream );
setTimeout(() => {
    logger.info('stopped recording');
    mic.stopRecording();
}, 3000);
mic.on('info', (info) => {
	console.log(info);
});
mic.on('error', (error) => {
	console.log(error);
});
*/


function StartRecord(fn, index){
   var sound = new ALSARecord({
        debug: true,    // Show stdout 
        destination_folder: '/tmp',
        filename: fn,
        alsa_format: 'dat',
        alsa_device: 'plughw:1,0'
    }); 
    sound.record();
    
    setTimeout(function () {
        sound.pause(); // pause the recording after five seconds 
    }, 5000);
    
    setTimeout(function () {
        sound.resume(); // and resume it two seconds after pausing 
    }, 7000);
    
    setTimeout(function () {
        sound.stop(); // stop after ten seconds 
    }, 10000);
    // you can also listen for various callbacks: 
    sound.on('complete', function () {
        console.log('Done with recording!');
        api.speechToText(data, './' + fn + index + '.wav', APPID,
                                        function(data){
                                            console.log('[user]' + data);
                                            //send to bot
                                            //play response
                                            //record again
                                            RecordSound(fn, index++);
                                        },
                                        function(error){

                                        });
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
api.accquireToken('84517151739b4a4f83ea1ce042cc348c',
                function(data){
                    STT_TOKEN = data;
                    tokenAccquired = true;
                    //while(STT_TOKEN != ''){
                        console.log('token='+STT_TOKEN);
                        var fn = 'temp_';
                        console.log(fn);
                        StartRecord(fn, 0);
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







