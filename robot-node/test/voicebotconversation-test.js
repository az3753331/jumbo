
var util = require('util');
var events = require('events');
var HTTPSWAPPER = require('../https-helper.js');
var BingSTTAPI = require('../bing-stt-wrapper.js');
var uuid = require('node-uuid');
var fs = require("fs");

var ALSARecord = require('../node-arecord.js');
var ALSAPlay = require('../node-aplay.js');
var bingAPI = new BingSTTAPI();

var APPID = uuid.v1();
var STT_TOKEN = '';
var tokenAccquired = false;
var index = 0;

var BOTWRAPPER = require('../botclient.js');
var bot = null;

var BOT_DIRECTLINE_KEY = '<BOT DIRECT KEY>';
var BING_SUBSCRIPTION_KEY = '<BING SPEECH API KEY>';

function PlayVoice(fn){
    var sound = new ALSAPlay();
    sound.play(fn);
}

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

    setTimeout(function () {
            console.log('stop recording!');
            sound.stop(); // stop after ten seconds 
        }, 3000);

    // you can also listen for various callbacks: 
    sound.on('complete', function () {
        bingAPI.speechToText(STT_TOKEN, folder + fn , APPID, 'zh-TW',
                                        function(sttText){
                                            console.log('[user]' + sttText);
                                            var sttResult = JSON.parse(sttText);
                                            if(sttResult.header.status !='success'){
                                                console.log('STT failed:' + sttResult.header.status);
                                            }
                                            else
                                            {
                                                //send to bot
                                                if(bot == null){
                                                    bot = new BOTWRAPPER();
                                                
                                                    bot.setDirectlineSecret(BOT_DIRECTLINE_KEY);
                                                    bot.accquireToken(function(data){
                                                            var result = bot.startConversation(function(botReply){
                                                                console.log('***** message recevied from bot = ' + JSON.stringify(botReply));
                                                                //botReply.attachments.content
                                                                var buffer = Buffer.from(botReply.attachments[0].content, 'base64');
                                                                var wstream = fs.createWriteStream('/tmp/output_' + index + '.wav');
                                                                wstream.write(buffer);
                                                                wstream.end();
                                                                
                                                                PlayVoice('/tmp/output_' + index + '.wav');


                                                                StartRecord('/tmp/','temp_');
                                                            });
                                                            convId = result.conversationId;
                                                            var userText = sttResult.header.lexical;
                                                            console.log('*** sending to bot:' + userText);
                                                            bot.sendMessage(result.conversationId,'user1',userText);
                                                        },
                                                        function(error){
                                                            console.log('error=' + error);
                                                        }
                                                    );
                                                }
                                                else
                                                {
                                                    bot.sendMessage(result.conversationId,'user1',sttResult.header.lexical);
                                                }
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
//console.log('test');

process.stdin.on('data', function (text) {
    console.log('received data:', util.inspect(text));
    if (text === 'quit\n') {
      done();
    }
  });

return;