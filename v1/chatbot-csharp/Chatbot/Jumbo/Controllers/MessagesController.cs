using System;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;
using System.Web.Http.Description;
using Microsoft.Bot.Connector;
using Newtonsoft.Json;
using System.Configuration;
using System.Collections.Generic;
using System.IO;
using System.Web;
using Jumbo.Helpers;
using Microsoft.Bot.Builder.Dialogs;

namespace Jumbo
{
    [BotAuthentication]
    public class MessagesController : ApiController
    {
        /// <summary>
        /// POST: api/Messages
        /// Receive a message from a user and reply to it
        /// </summary>
        public async Task<HttpResponseMessage> Post([FromBody]Activity activity)
        {
            try
            {
                if (activity.Type == ActivityTypes.Message)
                {
#if false
                ConnectorClient connector = new ConnectorClient(new Uri(activity.ServiceUrl));
                // calculate something for us to return
                int length = (activity.Text ?? string.Empty).Length;

                // return our reply to the user
                var replyText = $"你說：{activity.Text}";
                CognitiveService.BingTTS tts = new CognitiveService.BingTTS(ConfigurationManager.AppSettings["BingSpeechAPI_Key"]);
                var token = await tts.AcquireTokenAsync();
                Stream stream = await tts.Synthesize(replyText, "zh-TW");
                var sh = new StorageHelper(ConfigurationManager.AppSettings["StorageSASUri"].Replace("$$","&"));

                Activity voiceReply = activity.CreateReply(replyText);
                //var bytes = StreamToBytes(stream);

                var fn = sh.UploadFile(Guid.NewGuid().ToString() + ".wav", stream);

                if (voiceReply.Attachments == null)
                {
                    voiceReply.Attachments = new List<Attachment>();
                }
                voiceReply.Attachments.Add(new Attachment()
                {
                    ContentUrl = fn,
                    ContentType = "audio/mp4",
                    Name = "result.wav"
                });
                
                await connector.Conversations.ReplyToActivityAsync(voiceReply);
#else
                    //await Conversation.SendAsync(activity, () => new Dialogs.TranslationDialog());
                    //await Conversation.SendAsync(activity, () => new Dialogs.AskDialog());
                    await Conversation.SendAsync(activity, () => new Dialogs.JumboDialog());
#endif
                }
                else
                {
                    HandleSystemMessage(activity);
                }
            }
            catch (Exception exp)
            {
                ConnectorClient connector = new ConnectorClient(new Uri(activity.ServiceUrl));
                var exception = activity.CreateReply($"{exp.Message} - {exp.StackTrace}");
                await connector.Conversations.ReplyToActivityAsync(exception);

                throw exp;
            }
            var response = Request.CreateResponse(HttpStatusCode.OK);
            return response;
        }

        private Activity HandleSystemMessage(Activity message)
        {
            if (message.Type == ActivityTypes.DeleteUserData)
            {
                // Implement user deletion here
                // If we handle user deletion, return a real message
            }
            else if (message.Type == ActivityTypes.ConversationUpdate)
            {
                // Handle conversation state changes, like members being added and removed
                // Use Activity.MembersAdded and Activity.MembersRemoved and Activity.Action for info
                // Not available in all channels
            }
            else if (message.Type == ActivityTypes.ContactRelationUpdate)
            {
                // Handle add/remove from contact lists
                // Activity.From + Activity.Action represent what happened
            }
            else if (message.Type == ActivityTypes.Typing)
            {
                // Handle knowing tha the user is typing
            }
            else if (message.Type == ActivityTypes.Ping)
            {
            }

            return null;
        }
        private byte[] StreamToBytes(Stream stream)
        {
            using (var sr = new BinaryReader(stream))
            {
                List<byte> resp = new List<byte>();
                byte[] buffer = null;
                do
                {
                    buffer = sr.ReadBytes(1024);
                    resp.AddRange(buffer);
                } while (buffer != null && buffer.Length > 0);

                return resp.ToArray();
            }
        }
    }
}