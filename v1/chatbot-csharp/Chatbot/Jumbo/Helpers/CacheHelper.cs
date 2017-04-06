using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Jumbo.Helpers
{
    [Serializable]
    public class CacheHelper
    {
        public static void Add<T>(DateTime absoluteExpiry, string key, T item) where T : class
        {
            HttpContext.Current.Cache.Add(key, item, null, absoluteExpiry, System.Web.Caching.Cache.NoSlidingExpiration,
                                                    System.Web.Caching.CacheItemPriority.Default,
                                                    null);
        }
        public static T Get<T>(string key) where T:class
        {
            T v = (T)HttpContext.Current.Cache.Get(key);
            if (v == default(T))
            {
                return default(T);
            }
            else
            {
                return v;
            }
        }
    }
}