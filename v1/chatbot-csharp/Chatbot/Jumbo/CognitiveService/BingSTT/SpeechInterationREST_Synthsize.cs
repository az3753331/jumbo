using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Media;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;

namespace Jumbo.CognitiveService
{
    public partial class BingSTT
    {
        private string BaseUri = "https://speech.platform.bing.com/synthesize";


        public async Task<Stream> Synthesize(string text, string language = "", string token = null)
        {
            var lang = string.IsNullOrEmpty(language) ? Language : language;
           
            var speakerName = speakerNames[Language]["Female"];
            //var baseXml = $"<speak version='1.0' xml:lang='en-us'><voice xml:lang='{Language}' xml:gender='Female' name='Microsoft Server Speech Text to Speech Voice ({Language}, Yating, Apollo)'>{text}</voice></speak>";
            var baseXml = $"<speak version='1.0' xml:lang='en-us'><voice xml:lang='{lang}' xml:gender='Female' name='{speakerName}'>{text}</voice></speak>";
            if (!string.IsNullOrEmpty(token))
            {
                TOKEN = token;
            }
            if (String.IsNullOrEmpty(TOKEN))
            {
                TOKEN = await AcquireTokenAsync();
            }
            var client = new HttpClient();
            client.DefaultRequestHeaders.TryAddWithoutValidation("X-Microsoft-OutputFormat", "riff-16khz-16bit-mono-pcm");
            client.DefaultRequestHeaders.TryAddWithoutValidation("Content-Type", "application/ssml+xml");
            client.DefaultRequestHeaders.TryAddWithoutValidation("Authorization", $"Bearer {TOKEN}");
            client.DefaultRequestHeaders.TryAddWithoutValidation("User-Agent", "RetailDemo");
            var requestMessage = new HttpRequestMessage(HttpMethod.Post, BaseUri)
            {
                Content = new StringContent(baseXml)
            };
            var respMessage = await client.SendAsync(requestMessage); ;
            return await respMessage.Content.ReadAsStreamAsync();
        }
    }
}
