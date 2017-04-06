using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web;

namespace Jumbo.CognitiveService
{
    public class BingSearch
    {
        static readonly string REQUEST_URI = "https://api.cognitive.microsoft.com/bing/v5.0/search?q={0}&count=10&offset=0&mkt=zh-TW&safesearch=Moderate";

        public static async Task<string> SearchAsync(string query)
        {
            var key = ConfigurationManager.AppSettings["BingSearch_Key"];
            HttpClient httpClient = new HttpClient();
            httpClient.DefaultRequestHeaders.TryAddWithoutValidation("Ocp-Apim-Subscription-Key", key);
            httpClient.DefaultRequestHeaders.TryAddWithoutValidation("Content-Type", "application/x-www-form-urlencoded");
            httpClient.DefaultRequestHeaders.TryAddWithoutValidation("Content-Length", "0");
            var resp = await httpClient.GetAsync(string.Format(REQUEST_URI, query));
            var body = resp.Content as StreamContent;
            var text = await body.ReadAsStringAsync();

            return text;
        }
    }
}