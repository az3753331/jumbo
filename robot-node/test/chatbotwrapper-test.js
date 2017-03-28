var BOTWRAPPER = require('../botclient.js');
var HTTPSWAPPER = require('../https-helper.js');
var BingSTTAPI = require('../bing-stt-wrapper.js');
var uuid = require('node-uuid');
var ALSAPlay = require('../node-aplay.js');
var fs = require('fs');
const URL = require('url');

var bot = new BOTWRAPPER();
var https = new HTTPSWAPPER();
var player = new ALSAPlay();

var BOT_DIRECTLINE_KEY = 'X-O-skejDE0.cwA.n0k.PX7roOwYzPtkqr50ClLjRRBhz3v0e0rIYLgz7fXZjL4';
var BING_SUBSCRIPTION_KEY = '84517151739b4a4f83ea1ce042cc348c';

var socket;
var convId = '';

bot.setDirectlineSecret(BOT_DIRECTLINE_KEY);
bot.accquireToken(function(data){
        var result = bot.startConversation(function(data){
            console.log('****** message recevied from bot = ' + JSON.stringify(data));
            var id = data.id.split("|")[0];
            var wavFN = id + '-sync.wav';
            if(data.attachments != null && data.attachments != 'undefined'){
                var url = data.attachments[0].contentUrl;
                //Download file from contentUrl
                var headers = {
                        
                };
                var u = URL.parse(url);
                
                var result = https.requestSync(u.host, u.path, 'GET', null, null);

                
                var buffer = new Buffer(result.body,'binary');
                //fs.writeFile(id + '-sync-2.wav',result.body,null);
                fs.writeFile(wavFN,buffer,'binary',function(e){
                                    console.log('done');
                                });
                player.play(wavFN);
                /*
                https.request2(u.host, u.path ,'GET',
                        headers,
                        '',
                        function (data){
                            if(!fs.existsSync(id + '.wav')){
                                fs.writeFile(id + '.wav',data,function(e){
                                    console.log('done');
                                });
                            }else{
                                fs.unlinkSync(id + '.wav')
                                fs.writeFile(id + '.wav',data,function(e){
                                    //console.log(data);
                                });
                                console.log('written...');
                            }
                        },
                        function (error){
                            console.log('error=' + error);
                        },
                        function(){
                            //OnEnd
                            console.log('...here....');
                            //Play Sound file
                            player.play(id + '.wav');
                            //console.log('Exception=' + e);
                        });
                        */
            }
        });
        convId = result.conversationId;
        bot.sendMessage(result.conversationId,'user1','測試');
    },
    function(error){
        console.log('error=' + error);
    }
);

process.stdin.on('data', function (text) {
    //console.log('received data:', util.inspect(text));
    if (text === 'quit\n') {
      done();
    }else{
        bot.sendMessage(convId,'user1','test');
        //var resp = bot.receiveLastMessageSync(convId);

        /*
        {"type":"message","id":"1GiRVbh54c223QHZcoYepv|0000003","timestamp":"2017-03-15T01:52:23.8100989Z","channelId":"directline","from":{
        "id":"jumbochatbot","name":"Jumbo"},"conversation":{"id":"1GiRVbh54c223QHZcoYepv"},"text":"You sent test which was 4 characters","re
        plyToId":"1GiRVbh54c223QHZcoYepv|0000002"}
        */
    }
  });

