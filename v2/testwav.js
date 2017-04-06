const record = require('node-record-lpcm16');
const Detector = require('snowboy').Detector;
const Models = require('snowboy').Models;
const uuid = require('node-uuid');
const BOTCLIENT = require('./botclient.js');
const HTTPSWAPPER = require('./https-helper.js');
const URL = require('url');
var fs = require('fs');

//const request   = require('request');

//Const
const BOT_DIRECTLINE_KEY = 'X-O-skejDE0.cwA.n0k.PX7roOwYzPtkqr50ClLjRRBhz3v0e0rIYLgz7fXZjL4';
const BING_SUBSCRIPTION_KEY = '84517151739b4a4f83ea1ce042cc348c';
const STORAGE_INFO = {
  account:'botstatusdb',
  key:'4ga82rAldePN4yaMKrUBOyjHPKie3pViVqzuNK2Lt1BGSniqmh1GfCfQ49q56Nh2cDhfz5Z0C/ELR+ymnjq5uw==',
  container:'upload'
};
const models = new Models();


var bot = new BOTCLIENT('jumbo','michael',STORAGE_INFO);
var stream = null;
var https = new HTTPSWAPPER();
var IS_TRIGGERED = false;
var silenceCount = 0;
var BING_TOKEN = '';
var buffer = null;
var index = 0;
//https://github.com/Kitt-AI/snowboy/issues/1
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
                                     //PlayVoice(wavFN);
                                });
                //player.play(wavFN);
                //StartRecord('/tmp/','temp_');
            }
        });
        convId = result.conversationId;
        console.log('sending attachment...');
        //bot.sendMessage(result.conversationId,'user1','測試');
        var res = bot.sendAttachment({
            fileName:'test_0.wav',
            contentType:'audio/wav',
            buffer:getWav('./test_0.wav')
        }); //(null,getAttachmentJson(getWav('./test_0.wav'), 'audio/wav'));
        console.log('sent:' + res);
    },
    function(error){
        console.log('error=' + error);
    }
);


function getWav(fn){
  return fs.readFileSync(fn,{encoding:'binary'});
}
function getAttachmentJson(content, contentType){
    var r = bot.getAttachmentObject('test_0.wav', content, contentType);
    return r;
}
function onData_V2(data){
  var fn = './test_' + index + '.wav';
  if(IS_TRIGGERED){
    if(buffer == null){
      buffer = new Buffer(data);
    }else{
      buffer = Buffer.concat([buffer, new Buffer(data)]);
    }
  }else{
    if(buffer != null){
      var wav = getWavData(buffer);
      //bot.sendAttachment(attachment)
      var f = fs.createWriteStream(fn, {encoding:'binary'});
      f.write(wav);
      f.end();
      index ++;
      buffer = null;
    }
  }
}
process.stdin.on('data', function (text) {
    console.log('received data:', util.inspect(text));
    if (text === 'quit\n') {
      done();
    }
  });