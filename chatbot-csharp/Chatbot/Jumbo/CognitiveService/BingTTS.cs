using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web;

namespace Jumbo.CognitiveService
{
    public class BingTTS
    {
        private const string BaseUri = "https://speech.platform.bing.com/synthesize";
        private string SUBSCRIPTION_KEY = null;
        private string TOKEN = null;
        public BingTTS(string subscriptionKey)
        {
            SUBSCRIPTION_KEY = subscriptionKey;
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
            TOKEN = body;
            return TOKEN;
        }
        public async Task<Stream> Synthesize(string text, string language = "")
        {
            var speakerName = speakerNames[language]["Female"];
            //var baseXml = $"<speak version='1.0' xml:lang='en-us'><voice xml:lang='{Language}' xml:gender='Female' name='Microsoft Server Speech Text to Speech Voice ({Language}, Yating, Apollo)'>{text}</voice></speak>";
            var baseXml = $"<speak version='1.0' xml:lang='en-us'><voice xml:lang='{language}' xml:gender='Female' name='{speakerName}'>{text}</voice></speak>";
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

        static private Dictionary<string, string> Language_Codes = new Dictionary<string, string>
        {
            {"japanese","ja-JP" },
            {"chinese traditional","zh-TW" },
            {"chinese simplified","zh-CN" },
            {"english","en-US" },
            {"arabic","ar-EG" },
            {"germany","de-DE" },
            {"german","de-DE" },
            {"australis","en-AU" },
            {"australia","en-AU" },
            {"canadian","en-CA" },
            {"canada","en-CA" },
            {"united kingdom","en-GB" },
            {"britian","en-GB" },
            {"british","en-GB" },
            {"indian","en-IN" },
            {"spanish","es-ES" },
            {"mexico","es-MX" },
            {"french canada","fr-CA" },
            {"french","fr-FR" },
            {"frence","fr-FR" },
            {"italian","it-IT" },
            {"portuguese","pt-BR" },
            {"russian","ru-RU" },
            {"hong kong","zh-HK" },
        };
        private Dictionary<string, Dictionary<string, string>> speakerNames = new Dictionary<string, Dictionary<string, string>>{
            {
                "ar-EG",new Dictionary<string, string>{
                        { "Female","Microsoft Server Speech Text to Speech Voice (ar-EG, Hoda)" }
                }
            },
            {
                "de-DE",new Dictionary<string, string>{
                        { "Female","Microsoft Server Speech Text to Speech Voice (de-DE, Hedda)" },
                        { "Male","Microsoft Server Speech Text to Speech Voice (de-DE, Stefan, Apollo)" }
                }
            },
            {
                "en-AU",new Dictionary<string, string>{
                        { "Female","Microsoft Server Speech Text to Speech Voice (en-AU, Catherine" }
                }
            },
            {
                "en-CA",new Dictionary<string, string>{
                        { "Female","Microsoft Server Speech Text to Speech Voice (en-CA, Linda)" }
                }
            },
            {
                "en-GB",new Dictionary<string, string>{
                        { "Female","Microsoft Server Speech Text to Speech Voice (en-GB, Susan, Apollo))" },
                        { "Male","Microsoft Server Speech Text to Speech Voice (en-GB, George, Apollo)" }
                }
            },
            {
                "en-IN",new Dictionary<string, string>{
                        { "Male","Microsoft Server Speech Text to Speech Voice (en-IN, Ravi, Apollo)" }
                }
            },
            {
                "en-US",new Dictionary<string, string>{
                        { "Female","Microsoft Server Speech Text to Speech Voice (en-US, ZiraRUS)" },
                        { "Male","Microsoft Server Speech Text to Speech Voice (en-US, Ravi, Apollo)" }
                }
            },
            {
                "es-ES",new Dictionary<string, string>{
                        { "Female","Microsoft Server Speech Text to Speech Voice (es-ES, Laura, Apollo)" },
                        { "Male","Microsoft Server Speech Text to Speech Voice (es-ES, Pablo, Apollo)" }
                }
            },
            {
                "es-MX",new Dictionary<string, string>{
                        { "Male","Microsoft Server Speech Text to Speech Voice (es-MX, Raul, Apollo)" }
                }
            },
            {
                "fr-CA",new Dictionary<string, string>{
                        { "Female","Microsoft Server Speech Text to Speech Voice (fr-CA, Caroline)" }
                }
            },
            {
                "fr-FR",new Dictionary<string, string>{
                        { "Female","Microsoft Server Speech Text to Speech Voice (fr-FR, Julie, Apollo)" },
                        { "Male","Microsoft Server Speech Text to Speech Voice (fr-FR, Paul, Apollo)" }
                }
            },
            {
                "it-IT",new Dictionary<string, string>{
                        { "Male","Microsoft Server Speech Text to Speech Voice (it-IT, Cosimo, Apollo)" }
                }
            },
            {
                "ja-JP",new Dictionary<string, string>{
                        { "Female","Microsoft Server Speech Text to Speech Voice (ja-JP, Ayumi, Apollo)" },
                        { "Male","Microsoft Server Speech Text to Speech Voice (ja-JP, Ichiro, Apollo)" }
                }
            },
            {
                "pt-BR",new Dictionary<string, string>{
                        { "Male","Microsoft Server Speech Text to Speech Voice (pt-BR, Daniel, Apollo)" }
                }
            },
            {
                "ru-RU",new Dictionary<string, string>{
                        { "Female","Microsoft Server Speech Text to Speech Voice (pt-BR, Daniel, Apollo)" },
                        { "Male","Microsoft Server Speech Text to Speech Voice (ru-RU, Pavel, Apollo)" }
                }
            },
            {
                "zh-CN",new Dictionary<string, string>{
                        { "Female","Microsoft Server Speech Text to Speech Voice (zh-CN, HuihuiRUS)" },
                        //{ "Female","Microsoft Server Speech Text to Speech Voice (zh-CN, Yaoyao, Apollo)" },
                        { "Male", "Microsoft Server Speech Text to Speech Voice (zh-CN, Kangkang, Apollo)" }
                }
            },
            {
                "zh-HK",new Dictionary<string, string>{
                        { "Female","Microsoft Server Speech Text to Speech Voice (zh-HK, Tracy, Apollo)" },
                        { "Male","Microsoft Server Speech Text to Speech Voice (zh-HK, Danny, Apollo)" }
                }
            },
            {
                "zh-TW",new Dictionary<string, string>{
                        { "Female","Microsoft Server Speech Text to Speech Voice (zh-TW, Yating, Apollo)" },
                        { "Male","Microsoft Server Speech Text to Speech Voice (zh-TW, Zhiwei, Apollo)" }
                }
            }
        };
    }
}