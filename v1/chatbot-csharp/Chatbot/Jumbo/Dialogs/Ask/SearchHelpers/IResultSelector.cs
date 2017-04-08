using Microsoft.Bot.Builder.Luis.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Jumbo.Dialogs.Ask
{
    public interface IResultSelector
    {
        /// <summary>
        /// Compose query text send to Bing Search
        /// </summary>
        /// <param name="queryText">Query text</param>
        /// <example>Who is the president of USA</example>
        /// <param name="queryTopic"></param>
        /// <example>president of USA</example>
        /// <returns></returns>
        string GetBestResult(string result);
    }
}