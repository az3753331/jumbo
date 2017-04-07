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
                    account:'<storage account>',
                    key:'<storage key>',
                    container:'<container>'
                },
    BotInfo:{
        botId:'jumbo',
        userId:'michael',
        DirectLineSecret:'<direct line secret>'
    },
    CognitiveServiceInfo:{
        BingSpeechApiSubscriptionKey:'<bing api key>'
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