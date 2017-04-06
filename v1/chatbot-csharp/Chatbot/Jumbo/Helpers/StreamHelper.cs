using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web;

namespace Jumbo.Helpers
{
    public static class StreamHelper
    {
        public static string AsString(this Stream stream)
        {
            using (var sr = new StreamReader(stream))
            {
                return sr.ReadToEnd();
            }
        }

        public static async Task<Stream> LoadFrom(this string url)
        {
            HttpClient hc = new HttpClient();
            var result = await hc.GetAsync(url);
            var sc = result.Content as StreamContent;
            var buffer = await sc.ReadAsByteArrayAsync();

            return new MemoryStream(buffer);
        }
    }
}