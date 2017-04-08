using Jumbo.CognitiveService;
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

namespace Jumbo.Dialogs
{

    public partial class JumboDialog
    {
       
        [LuisIntent("AskWhat")]
        public async Task AskWhat(IDialogContext context, LuisResult result)
        {
            var bing = await DoSearchAsync(result);
            await ReplyAsync(context, context.Activity.AsMessageActivity() as Activity, "");
        }
    }
}