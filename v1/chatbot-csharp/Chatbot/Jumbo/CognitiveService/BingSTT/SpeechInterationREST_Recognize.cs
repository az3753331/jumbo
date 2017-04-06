using Jumbo.Helpers;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web;

namespace Jumbo.CognitiveService
{
    public partial class BingSTT
    {
        public async Task<Stream> Recognize(Stream voice, string token = null)
        {
            var appId = Guid.NewGuid().ToString();
            var locale = ConfigurationManager.AppSettings["Speech_Language"];
            var instanceId = Guid.NewGuid().ToString();
            var requestId = Guid.NewGuid().ToString();
            var url = $"https://speech.platform.bing.com/recognize?scenarios=websearch&appid={appId}&locale={locale}&device.os=your_device_os&version=3.0&format=json&instanceid={instanceId}&requestid={requestId}";
            if (!string.IsNullOrEmpty(token))
            {
                TOKEN = token;
            }
            if (String.IsNullOrEmpty(TOKEN))
            {
                TOKEN = await AcquireTokenAsync();
            }
            var client = new HttpClient();
            client.DefaultRequestHeaders.TryAddWithoutValidation("Content-Type", "audio/wav; samplerate=16000");// 44000");
            client.DefaultRequestHeaders.TryAddWithoutValidation("Authorization", $"Bearer {TOKEN}");
            var requestMessage = new HttpRequestMessage(HttpMethod.Post, url)
            {
                Content = new StreamContent(voice)
            };
            var respMessage = await client.SendAsync(requestMessage);
            Logger.Info($"respMessage.IsSuccessStatusCode={respMessage.IsSuccessStatusCode}");
            Logger.Info($"respMessage.StatusCode={respMessage.StatusCode}");

            if (!respMessage.IsSuccessStatusCode)
            {
                string text = null;
                respMessage.TryGetContentValue<string>(out text);
                Logger.Info($"respMessage.Body={text}");

            }
            return await respMessage.Content.ReadAsStreamAsync();
        }
    }
}