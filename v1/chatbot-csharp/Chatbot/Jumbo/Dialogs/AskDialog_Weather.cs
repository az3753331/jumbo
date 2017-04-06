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

    public partial class AskDialog:LuisDialog<string>
    {
       
        [LuisIntent("builtin.intent.weather.check_weather")]
        public async Task AskWeather(IDialogContext context, LuisResult result)
        {
            var bing = await DoSearchAsync(result);
            await ReplyAsync(context, context.Activity.AsMessageActivity() as Activity, "");
        }
    }
}