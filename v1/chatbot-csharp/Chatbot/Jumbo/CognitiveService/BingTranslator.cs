using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web;
using TranslatorLib;

namespace Jumbo.Helpers
{
    public class BingTranslator
    {
        private string TOKEN = null;
        public static string GetLanguageCode(string language)
        {
            switch (language.ToLower())
            {
                case "chinese tranditional":
                case "chinese traditional":
                case "traditional chinese":
                case "tranditional chinese":
                    return "zh-CHT";
                case "chinese simplified":
                case "simplified chinese":
                    return "zh-CHS";
                case "english":
                    return "en";
                default:
                    var cul = System.Globalization.CultureInfo.GetCultures(System.Globalization.CultureTypes.AllCultures).Where(c => c.EnglishName.ToLower() == language).SingleOrDefault();
                    if (cul == null)
                        return null;
                    return cul.TextInfo.CultureName;
            }
            //return "zh-CHT";
        }
        public async Task<string> AcquireTokenAsync(string key)
        {
            var url = "https://api.cognitive.microsoft.com/sts/v1.0/issueToken";//"https://api.projectoxford.ai/speech/v0/internalIssueToken";// 
            HttpClient httpClient = new HttpClient();
            httpClient.DefaultRequestHeaders.TryAddWithoutValidation("Ocp-Apim-Subscription-Key", key);
            httpClient.DefaultRequestHeaders.TryAddWithoutValidation("Content-Type", "application/x-www-form-urlencoded");
            httpClient.DefaultRequestHeaders.TryAddWithoutValidation("Content-Length", "0");
            var resp = await httpClient.PostAsync(url, null);
            var text = resp.Content as StreamContent;
            var body = await text.ReadAsStringAsync();

            TOKEN = body;
            return TOKEN;
        }
        public async Task<string> TranslateAsync(string phrase, string destLanguage)
        {
            var RequestUrl = "https://api.microsofttranslator.com/v2/http.svc/Translate?text={0}&to={1}";

            HttpClient httpClient = new HttpClient();
            httpClient.DefaultRequestHeaders.TryAddWithoutValidation("Authorization","Bearer " + TOKEN);
            var resp = await httpClient.GetAsync(string.Format(RequestUrl, phrase, destLanguage));
            var body = resp.Content as StreamContent;
            var text = await body.ReadAsStringAsync();
            var startIndex = text.IndexOf(">") + 1;
            var endIndex = text.IndexOf("</string") - 1;
            text = text.Substring(startIndex, endIndex - startIndex + 1);
            return text;
        }
    }
}