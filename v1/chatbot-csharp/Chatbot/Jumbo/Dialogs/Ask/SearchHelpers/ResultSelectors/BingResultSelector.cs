using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Jumbo.Dialogs.Ask
{
    public class BingResultSelector: IResultSelector
    {
        public string GetBestResult(string result)
        {
            if (!string.IsNullOrEmpty(result))
            {
                dynamic o = JsonConvert.DeserializeObject<dynamic>(result);
                if (o.webPages != null && o.webPages.value != null)
                {
                    return o.webPages.value[0].snippet;
                }
            }
            return null;
        }
    }
}