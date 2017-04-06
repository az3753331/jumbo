using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;

namespace Jumbo.CognitiveService
{
    public partial class BingSTT
    {
        private string SUBSCRIPTION_KEY = null;
        private string TOKEN;
        private string Language = null;

        
        public BingSTT(string key1, string language)
        {
            SUBSCRIPTION_KEY = key1;
            Language = language;
        }
        public async Task<string> AcquireTokenAsync()
        {
            var url = "https://api.cognitive.microsoft.com/sts/v1.0/issueToken";//"https://api.projectoxford.ai/speech/v0/internalIssueToken";// 
            HttpClient httpClient = new HttpClient();
            httpClient.DefaultRequestHeaders.TryAddWithoutValidation("Ocp-Apim-Subscription-Key", SUBSCRIPTION_KEY);
            httpClient.DefaultRequestHeaders.TryAddWithoutValidation("Content-Type", "application/x-www-form-urlencoded");
            httpClient.DefaultRequestHeaders.TryAddWithoutValidation("Content-Length", "0");
            var resp = await httpClient.PostAsync(url, null);
            var text = resp.Content as StreamContent;
            var body = await text.ReadAsStringAsync();
            return body;
        }
        public void Dispose()
        {
            //throw new NotImplementedException();
        }
        /*
        public async Task<string> Recognize(Stream stream)
        {
            //https://speech.platform.bing.com/recognize
            if (string.IsNullOrEmpty(TOKEN))
            {
                TOKEN = await AcquireTokenAsync();
            }
            HttpClient httpClient = new HttpClient();
            httpClient.DefaultRequestHeaders.TryAddWithoutValidation("Authorization", $"Bearer {TOKEN}");
            httpClient.DefaultRequestHeaders.TryAddWithoutValidation("Content-Type", $"audio/wav; codec=audio/pcm; samplerate=16000");
            var requestUrl = $"https://speech.platform.bing.com/recognize?version=3.0&instanceid={Guid.NewGuid().ToString()}&scenarios=catsearch&appid=D4D52672-91D7-4C74-8AD8-42B1D98141A5&format=json&device.os=win10&requestid={Guid.NewGuid().ToString()}&locale=en-US";
            var resp = await httpClient.PostAsync(
                                    requestUrl,
                                    new StreamContent(stream));
            
            using (var sr = new StreamReader(await resp.Content.ReadAsStreamAsync())) {
                var text = sr.ReadToEnd();

                return text;
                
            }
        }
        */
    }
}
