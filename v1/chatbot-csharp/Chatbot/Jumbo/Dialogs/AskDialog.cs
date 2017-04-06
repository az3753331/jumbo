using Jumbo.CognitiveService;
using Jumbo.Helpers;
using Microsoft.Bot.Builder.Dialogs;
using Microsoft.Bot.Builder.Luis;
using Microsoft.Bot.Builder.Luis.Models;
using Microsoft.Bot.Connector;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using System.Web;

namespace Jumbo.Dialogs
{
    [Serializable]
    [LuisModel("c27c4af7-d44a-436f-a081-841bb834fa29", "6d35713e91ae40859618c38a6ceb95c5")]
    public partial class AskDialog:LuisDialog<string>
    {
        private async Task ReplyAsync(IDialogContext context,Activity activity, string text)
        {
            var language = ConfigurationManager.AppSettings["Speech_Language"];
            Activity reply = activity.CreateReply(text);
            CognitiveService.BingTTS tts = new CognitiveService.BingTTS(ConfigurationManager.AppSettings["BingSpeechAPI_Key"]);
            var token = await tts.AcquireTokenAsync();
            Stream stream = await tts.Synthesize(reply.Text, language);// "zh-TW");
            var sh = new StorageHelper(ConfigurationManager.AppSettings["StorageSASUri"].Replace("$$", "&"));

            var fn = sh.UploadFile(Guid.NewGuid().ToString() + ".wav", stream);

            if (reply.Attachments == null)
            {
                reply.Attachments = new List<Attachment>();
            }
            reply.Attachments.Add(new Attachment()
            {
                ContentUrl = fn,
                ContentType = "audio/mp4",
                Name = $"{reply.Id.Replace("|","")}.wav"
            });
        }
        async Task<string> DoSearchAsync(LuisResult result)
        {
            EntityRecommendation topic = null, subject = null;
            result.TryFindEntity("Topic", out topic);
            result.TryFindEntity("Subject", out subject);
            var query = $"{subject.Entity}+{topic.Entity}+{result.Query}";
            var bingResult = await BingSearch.SearchAsync(query);

            return bingResult;
        }
        string ParseResult(string bingResult)
        {
            dynamic o = JsonConvert.DeserializeObject<dynamic>(bingResult);

            return null;
        }
        [LuisIntent("None")]
        public async Task None(IDialogContext context, LuisResult result)
        {
            await ReplyAsync(context, context.Activity.AsMessageActivity() as Activity, App_GlobalResources.TextMessages.BotDontUnderstand);
        }
        
    }
}