using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Microsoft.Bot.Builder.Luis.Models;
using System.Configuration;

namespace Jumbo.Dialogs.Ask
{
    public class WhyComponser : IQueryComposer
    {
        public string ComposeQuery(string queryText, string queryTopic, string languageCode)
        {
            languageCode = languageCode ?? ConfigurationManager.AppSettings["Speech_Language"];
            switch (languageCode)
            {
                case "en-US":
                    return queryTopic + " " + "because";
                case "zh-TW":
                    return queryTopic + " " + "因為";
                default:
                    return queryTopic + " " + "because";

            }
        }
    }
}