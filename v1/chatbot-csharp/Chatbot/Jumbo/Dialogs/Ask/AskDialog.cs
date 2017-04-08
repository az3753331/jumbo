using Autofac.Integration.Mvc;
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
using System.Web.Mvc;
using Autofac;
using Jumbo.Dialogs.Ask;

namespace Jumbo.Dialogs
{
    //[Serializable]
    //[LuisModel("cad19466-81e6-4d84-a521-815495915e3d", "6d35713e91ae40859618c38a6ceb95c5")]
    //public partial class AskDialog:LuisDialog<string>
    public partial class JumboDialog
    {
        
        private async Task ReplyAsync(IDialogContext context,Activity activity, string text)
        {
            var language = ConfigurationManager.AppSettings["Speech_Language"];
            Activity reply = activity.CreateReply(text);
            CognitiveService.BingTTS tts = new CognitiveService.BingTTS(ConfigurationManager.AppSettings["BingSpeechAPI_Key"]);
            var token = await tts.AcquireTokenAsync();
            Stream stream = await tts.Synthesize(reply.Text, language);// "zh-TW");
            var sh = new StorageHelper();
            var n = Guid.NewGuid().ToString() + ".wav";
            var fn = sh.UploadFile(n, stream);

            if (reply.Attachments == null)
            {
                reply.Attachments = new List<Attachment>();
            }
            reply.Attachments.Add(new Attachment()
            {
                ContentUrl = fn,
                ContentType = "audio/mp4",
                Name = n
            });
            Logger.Info("AskDialog::Reply to user - " + JsonConvert.SerializeObject(reply));
            await context.PostAsync(reply);
        }
        private IQueryComposer GetComposer(string key)
        {
            return GetService<IQueryComposer>(key);
            //var resolver = ((AutofacDependencyResolver)DependencyResolver.Current).ApplicationContainer;
            //return resolver.ResolveKeyed<IQueryComposer>(key);
        }
        private T GetService<T>(string key)
        {
            var resolver = ((AutofacDependencyResolver)DependencyResolver.Current).ApplicationContainer;
            return resolver.ResolveKeyed<T>(key);
        }
        async Task<string> DoSearchAsync(LuisResult result)
        {

            EntityRecommendation subject = null, topic = null;
            result.TryFindEntity("Subject", out subject);
            result.TryFindEntity("Topic", out topic);
            var query = topic?.Entity + subject?.Entity;
            var lang = ConfigurationManager.AppSettings["Speech_Language"];
            var bingQueryText = GetComposer(result.TopScoringIntent.Intent)?.ComposeQuery(result.Query, query, lang ?? "zh-TW");

            var bingResult = BingSearch.SearchAsync(bingQueryText);
            var kgnaResult = BingSearch.KGnASearchAsync(bingQueryText);

            var results = await Task.WhenAll(bingResult, kgnaResult);

            var bing = GetService<IResultSelector>("Bing");
            var kgna = GetService<IResultSelector>("BingKGnA");

            var b = bing.GetBestResult(results[0]);
            var k = kgna.GetBestResult(results[1]);

            var r = k ?? b ?? App_GlobalResources.TextMessages.BotNoAnswer;

            return r;
        }
   
        //[LuisIntent("None")]
        //public async Task None(IDialogContext context, LuisResult result)
        //{
        //    await ReplyAsync(context, context.Activity.AsMessageActivity() as Activity, App_GlobalResources.TextMessages.BotDontUnderstand);
        //}
        
    }
}