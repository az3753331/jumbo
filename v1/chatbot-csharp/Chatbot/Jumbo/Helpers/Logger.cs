using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Web;

namespace Jumbo.Helpers
{
    public class Logger
    {
        public static void Info(string message)
        {
            var log = $"[{DateTime.UtcNow}]{message}";
            //Console.WriteLine($"[{DateTime.UtcNow}]{message}");

            Trace.WriteLine(log);
        }
    }
}