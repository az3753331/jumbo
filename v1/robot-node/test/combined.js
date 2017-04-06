var BOTWRAPPER = require('../botclient.js');
var HTTPSWAPPER = require('../https-helper.js');
var BingSTTAPI = require('../bing-stt-wrapper.js');
var uuid = require('node-uuid');
var ALSAPlay = require('../node-aplay.js');
var fs = require('fs');
const URL = require('url');
var util = require('util');

var ALSARecord = require('../node-arecord.js');

var bot = new BOTWRAPPER();
var https = new HTTPSWAPPER();
var player = new ALSAPlay();
var bingAPI = new BingSTTAPI();

var BOT_DIRECTLINE_KEY = 'X-O-skejDE0.cwA.n0k.PX7roOwYzPtkqr50ClLjRRBhz3v0e0rIYLgz7fXZjL4';
var BING_SUBSCRIPTION_KEY = '84517151739b4a4f83ea1ce042cc348c';

var socket;
var convId = '';
var APPID = uuid.v1();
var STT_TOKEN = '';
var tokenAccquired = false;
var index = 0;


bot.setDirectlineSecret(BOT_DIRECTLINE_KEY);

bot.accquireToken(function(data){
        var result = bot.startConversation(function(data){
            console.log('****** message recevied from bot = ' + JSON.stringify(data));
            var id = data.id.split("|")[0];
            var wavFN = id + '-sync.wav';
            console.log('==>>' + data.attachments != null && data.attachments != 'undefined');
            if(data.attachments != null && data.attachments != 'undefined'){
                var url = data.attachments[0].contentUrl;
                //Download file from contentUrl
                var headers = {
                        
                };
                var u = URL.parse(url);
                
                console.log('downloading voice file...');
                var result = https.requestSync(u.host, u.path, 'GET', null, null);

                
                var buffer = new Buffer(result.body,'binary');
                //fs.writeFile(id + '-sync-2.wav',result.body,null);
                fs.writeFile(wavFN,buffer,'binary',function(e){
                                    console.log('done');
                                     PlayVoice(wavFN);
                                });
                //player.play(wavFN);

                
                StartRecord('/tmp/','temp_');
            }
        });
        convId = result.conversationId;
        //bot.sendMessage(result.conversationId,'user1','測試');
    },
    function(error){
        console.log('error=' + error);
    }
);

function PlayVoice(fn){
    player.play(fn);
}

function StartRecord(folder, prefix){
    PlayVoice('../media/begin.wav');
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
    index++;
    sound.record();

    setTimeout(function () {
            console.log('stop recording!');
            PlayVoice('../media/end.wav');
            sound.stop();
        }, 3000);

    // you can also listen for various callbacks: 
    sound.on('complete', function () {
        console.log('TOKEN=' + STT_TOKEN);
        bingAPI.speechToText(STT_TOKEN, folder + fn , APPID, 'zh-TW',
                                        function(sttText){
                                            console.log('[user]' + sttText);
                                            var sttResult = JSON.parse(sttText);
                                            if(sttResult.header.status !='success'){
                                                console.log('STT failed:' + sttResult.header.status);

                                                StartRecord('/tmp/','temp_');
                                            }
                                            else
                                            {
                                                //send to bot
                                                bot.sendMessage(convId,'user1',sttResult.header.lexical);
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

bingAPI.setSubscriptionKey(BING_SUBSCRIPTION_KEY);
bingAPI.accquireToken(function(data){
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