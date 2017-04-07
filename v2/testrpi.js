var RPI = require('./RPiVoiceAgent.js');

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
        botId:'jumbo',
        userId:'michael',
        DirectLineSecret:'X-O-skejDE0.cwA.n0k.PX7roOwYzPtkqr50ClLjRRBhz3v0e0rIYLgz7fXZjL4'
    },
    CognitiveServiceInfo:{
        BingSpeechApiSubscriptionKey:'84517151739b4a4f83ea1ce042cc348c'
    }
};



var agent = new RPI(CONFIGURATION.StorageInfo,
                        {
                            file: 'resources/hello2.pmdl',
                            sensitivity: '0.5',
                            hotwords : 'hello'
                        },
                        CONFIGURATION.BotInfo,
                        {
                            ERROR_ERROR_OCCUR : './media/erroroccur.wav',
                            ERROR_IDONTUNDERSTAND : './media/idontunderstand.wav'
                        });
agent.start(
    /* voice uploaded */
    function(account,container,fn){
        //send message to jumbo
        return null;
    },
    /* hotword detected */
    function(){

    },
    /* bot replied */
    function(data){

    }
);