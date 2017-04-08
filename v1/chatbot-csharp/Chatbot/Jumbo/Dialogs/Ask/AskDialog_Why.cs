using Autofac.Integration.Mvc;
using Jumbo.CognitiveService;
using Jumbo.Dialogs.Ask;
using Jumbo.Helpers;
using Microsoft.Bot.Builder.Dialogs;
using Microsoft.Bot.Builder.Luis;
using Microsoft.Bot.Builder.Luis.Models;
using Microsoft.Bot.Connector;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;
using Autofac;

namespace Jumbo.Dialogs
{
  
    public partial class JumboDialog
    {
        [LuisIntent("AskWhy")]
        public async Task AskWhy(IDialogContext context, LuisResult result)
        {
            Logger.Info($"Intent::AskWhy - {result.Query}");
            var bing = await DoSearchAsync(result);

            Logger.Info($"Intent::AskWhy result - {bing}");
            await ReplyAsync(context, context.Activity.AsMessageActivity() as Activity, bing);
        }
    }
}