
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


function StartRecord(folder, prefix, index){
    var fn = prefix + index + '.wav';
    var sound = new ALSARecord({
        debug: true,    // Show stdout 
        destination_folder: folder,
        filename: fn,
        alsa_format: 'cd',
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
        console.log('stop recording!');
        sound.stop(); // stop after ten seconds 
    }, 3000);
    // you can also listen for various callbacks: 
    sound.on('complete', function () {
        console.log('Done with recording!');
        api.speechToText(STT_TOKEN, folder + fn , APPID,
                                        function(data){
                                            console.log('[user]' + data);
                                            //send to bot
                                            //play response
                                            //record again
                                            StartRecord(folder, prefix, ++index);
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
                        StartRecord('/tmp/','temp_', 0);
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







