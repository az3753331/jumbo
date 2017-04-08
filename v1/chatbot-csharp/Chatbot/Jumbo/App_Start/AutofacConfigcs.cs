using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Autofac;
using Autofac.Builder;
using System.Web.Mvc;
using Autofac.Integration.Mvc;
using System.Web.Http;
using Jumbo.Dialogs.Ask;

namespace Jumbo
{
    public class AutofacConfig
    {
        public static void Register()
        {
            var builder = new ContainerBuilder();
            builder.Register<IQueryComposer>(c => new Jumbo.Dialogs.Ask.WhyComponser())
                                                        .AsImplementedInterfaces()
                                                        .Keyed("AskWhy", typeof(IQueryComposer));

            builder.Register<IResultSelector>(c => new BingKGnAResultSelector())
                                                .AsImplementedInterfaces()
                                                .Keyed("Bing", typeof(IResultSelector));

            builder.Register<IResultSelector>(c => new BingKGnAResultSelector())
                                                .AsImplementedInterfaces()
                                                .Keyed("BingKGnA", typeof(IResultSelector));

            var container = builder.Build();
            DependencyResolver.SetResolver(new AutofacDependencyResolver(container));
        }
    }
}