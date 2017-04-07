var RPI = require('./RPiVoiceAgent.js');
var JUMBO = require('./botclient.js');
var stream = require('stream');

const AUDIO_CONFIG = 
{
    sampleRate: 16000,
    channels: 1,
    bitDepth: 16
};
const CONFIGURATION = 
{
    StorageInfo:{
                    account:'botstatusdb',
                    key:'4ga82rAldePN4yaMKrUBOyjHPKie3pViVqzuNK2Lt1BGSniqmh1GfCfQ49q56Nh2cDhfz5Z0C/ELR+ymnjq5uw==',
                    container:'upload'
                },
    BotInfo:{
        DirectLineSecret:'X-O-skejDE0.cwA.n0k.PX7roOwYzPtkqr50ClLjRRBhz3v0e0rIYLgz7fXZjL4'
    },
    CognitiveServiceInfo:{
        BingSpeechApiSubscriptionKey:'84517151739b4a4f83ea1ce042cc348c'
    }
};

var Speaker = require('speaker');

var bot = new JUMBO('jumbo','michael',CONFIGURATION.StorageInfo);
bot.setDirectlineSecret(CONFIGURATION.BotInfo.DirectLineSecret);
bot.accquireToken(function(data){
        var result = bot.startConversation(function(data){
            console.log('****** message recevied from bot = ' + data.text);
            var id = data.id.split("|")[0];
            var wavFN = id + '-sync.wav';
            console.log('==>>' + data.attachments != null && data.attachments != 'undefined');
            if(data.attachments != null && data.attachments != 'undefined'){
                var url = data.attachments[0].contentUrl;
                //Streaming
                var speaker = new Speaker({
                    channels: 1,          // 2 channels
                    bitDepth: 16,         // 16-bit samples
                    sampleRate: 16000     // 44,100 Hz sample rate
                });
                speaker.on('error',function(err){
                    console.log('err=' + err);
                });
                var passStream = bot.getDownloadStream(
                            CONFIGURATION.StorageInfo.container, 
                            data.attachments[0].name, 
                            function(err,result,response){
                                passStream.end();
                            });
                passStream.pipe(speaker);
            }
        });
        convId = result.conversationId;
    },
    function(error){
        console.log('error=' + error);
    }
); 

var agent = new RPI(CONFIGURATION.StorageInfo,
                        {
                        file: 'resources/hello2.pmdl',
                        sensitivity: '0.5',
                        hotwords : 'hello'
                    });
agent.start(
    /* voice uploaded */
    function(account,container,fn){
        //send message to jumbo
        bot.sendMessage(
            '',
            [{
                contentType:'audio/wav',
                contentUrl:'https://' + account + '.blob.core.windows.net/' +
                                        container + '/' +
                                        fn,
                name:fn
            }]);
    },
    /* hotword detected */
    function(){

    }
);;