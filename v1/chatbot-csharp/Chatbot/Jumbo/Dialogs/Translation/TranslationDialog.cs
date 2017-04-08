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
using Jumbo.Helpers;

namespace Jumbo.Dialogs
{
    [Serializable]
    [LuisModel("cad19466-81e6-4d84-a521-815495915e3d", "6d35713e91ae40859618c38a6ceb95c5")]
    [LuisModel("5ff5bdf9-e01e-445e-b6c1-ea5d3ec4917f", "6d35713e91ae40859618c38a6ceb95c5", LuisApiVersion.V2)]
    public partial class JumboDialog:LuisDialog<object>
    {
        const string TOKEN_CACHE_KEY = "_SPEECH_TOKEN_";
        protected override async Task MessageReceived(IDialogContext context, IAwaitable<IMessageActivity> item)
        {
            var activity = await item;

            try
            {
                Logger.Info($"message received:{JsonConvert.SerializeObject(activity)}");

                if (activity.Attachments != null && activity.Attachments.Count > 0)
                {
                    string token = CacheHelper.Get<string>(TOKEN_CACHE_KEY);
                    BingSTT stt = new BingSTT(ConfigurationManager.AppSettings["BingSpeechAPI_Key"], ConfigurationManager.AppSettings["Speech_Language"]);

                    if (string.IsNullOrEmpty(token))
                    {
                        Logger.Info($"token cache not exists!");
                        token = await stt.AcquireTokenAsync();
                        Logger.Info($"new token acquired:{token}");
                        CacheHelper.Add<string>(DateTime.UtcNow.AddMinutes(5), TOKEN_CACHE_KEY, token);
                    }
                    string text = "";
                    Stream result = null;
                    if (activity.Attachments[0].Content == null)
                    {
                        Logger.Info($"recognizing via url:{activity.Attachments[0].ContentUrl}");
                        var req = await StreamHelper.LoadFrom(activity.Attachments[0].ContentUrl);
                        if (req.CanSeek)
                        {
                            Logger.Info($"length={req.Length}");
                        }
                        result = await stt.Recognize(req, token);
                        Logger.Info($"recognized");
                    }
                    else
                    {
                        Logger.Info($"recognizing via content");
                        result = await stt.Recognize(activity.Attachments[0].Content as Stream, token);
                        Logger.Info($"recognized");
                    }
                    text = result.AsString();
                    Logger.Info($"{text}");
                    dynamic j = JsonConvert.DeserializeObject(text);
                    activity.Attachments = null;
                    activity.Text = j.results[0].lexical;
                }
                await base.MessageReceived(context, item);
            }
            catch (Exception exp)
            {
                Logger.Info($"Exception:{exp.Message} - {exp.StackTrace}");
                if(exp.InnerException != null)
                {
                    Logger.Info($"Exception:{exp.InnerException.Message} - {exp.InnerException.StackTrace}");
                }
                await ReplyAsync(context, (Activity)activity, $"錯誤:{exp.Message}");
                throw exp;
            }
        }
        private string GetLanguageCode(string language)
        {
            switch (language.Replace("文","").Replace("語","").Replace("國話",""))
            {
                case "日":return "ja-JP";
                case "英":return "en-US";
                case "韓":return "ko-KR";
                case "中":return "zh-TW";
                default:return "zh-TW";
            }
        }
        private void SaveState(IDialogContext context, string key, string value)
        {
            context.ConversationData.SetValue<string>(key, value);
        }
        private string GetState(IDialogContext context, string key)
        {
            string value = null;
            if( context.ConversationData.TryGetValue<string>(key, out value))
            {
                return value;
            }
            else
            {
                return null;
            }
        }
        private async Task ReplyAsync(IDialogContext context,Activity activity, string text, string languageCode = null)
        {
            if (languageCode == null)
            {
                languageCode = GetState(context, "LanguageCode");// ConfigurationManager.AppSettings["Speech_Language"];
            }
            else
            {
                SaveState(context, "LanguageCode", languageCode);
            }
            Activity reply = activity.CreateReply(text);
            CognitiveService.BingTTS tts = new CognitiveService.BingTTS(ConfigurationManager.AppSettings["BingSpeechAPI_Key"]);
            var token = await tts.AcquireTokenAsync();
            Stream stream = await tts.Synthesize(reply.Text, languageCode);
            var sh = new StorageHelper();
            var guid = Guid.NewGuid().ToString();
            var fn = sh.UploadFile(guid + ".wav", stream);
            Logger.Info($"result uploaded to {fn}");
            if (reply.Attachments == null)
            {
                reply.Attachments = new List<Attachment>();
            }
            reply.Attachments.Add(new Attachment()
            {
                ContentUrl = fn,
                ContentType = "audio/mp4",
                Name = guid + ".wav"
            });

            await context.PostAsync(reply);
        }
        
        [LuisIntent("None")]
        public async Task None(IDialogContext context, LuisResult result)
        {
            Logger.Info("Intent::None");
            await ReplyAsync(context, context.Activity.AsMessageActivity() as Activity, App_GlobalResources.TextMessages.BotDontUnderstand, ConfigurationManager.AppSettings["Speech_Language"]);
        }

        [LuisIntent("Translation")]
        public async Task Translation(IDialogContext context, LuisResult result)
        {
            Logger.Info("Intent::Translation");
            EntityRecommendation language = null, phrase = null;
            result.TryFindEntity("Language", out language);
            result.TryFindEntity("Phrase", out phrase);
            Logger.Info($"Language is {language}");
            Logger.Info($"Phrase is {phrase}");
            var languageCode = GetLanguageCode(language.Entity);
            if (language == null || phrase == null)
            {
                Logger.Info($"return missing parameters...");
                await ReplyAsync(context, context.Activity.AsMessageActivity() as Activity, 
                        App_GlobalResources.TextMessages.BotTranslationMissingParameter,
                        ConfigurationManager.AppSettings["Speech_Language"]);
                Logger.Info($"return missing parameters...done");
                context.Done(App_GlobalResources.TextMessages.BotTranslationMissingParameter);
            }
            else
            {
                //var destLan = new TranslatorAPIHelper();//TranslatorAPIHelper.DoTranslation(phrase.Entity, languageCode);

                var translator = new BingTranslator();
                var token = await translator.AcquireTokenAsync(ConfigurationManager.AppSettings["Translator_Key"]);
                var resultText = await translator.TranslateAsync(phrase.Entity, languageCode);
                await ReplyAsync(context, context.Activity.AsMessageActivity() as Activity, resultText, languageCode);

                context.Done(resultText);
            }
            //await ReplyAsync(context, context.Activity.AsMessageActivity() as Activity, App_GlobalResources.TextMessages.BotDontUnderstand);
        }

    }
}