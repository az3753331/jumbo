using Microsoft.WindowsAzure.Storage;
using Microsoft.WindowsAzure.Storage.Blob;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.IO;
using System.Linq;
using System.Web;

namespace Jumbo.Helpers
{
    /// <summary>
    /// The storage specified here has to be blob public accessible 
    /// </summary>
    public class StorageHelper
    {
        private string CONNECTION_STRING = null;
        private string SAS = null;
        public StorageHelper()
        {
        }

        public string UploadFile(String fileName, byte[] content)
        {
            try
            {
                //var container = new CloudBlobContainer(new Uri(CONNECTION_STRING));
                var acct = new CloudStorageAccount(new Microsoft.WindowsAzure.Storage.Auth.StorageCredentials(
                                                ConfigurationManager.AppSettings["StorageAccount"],
                                                ConfigurationManager.AppSettings["StorageKey"]), true);
                var bc = acct.CreateCloudBlobClient();
                var cr = bc.GetContainerReference(ConfigurationManager.AppSettings["StorageContainer"]);
                var blob = cr.GetBlockBlobReference(fileName);
                //var bbr = container.GetBlockBlobReference(fileName);
                blob.UploadFromByteArray(content, 0, content.Length);

                return blob.Uri.ToString();
            }
            catch (Exception exp)
            {
                throw exp;
            }

        }

        public string UploadFile(String fileName, Stream content)
        {
            try
            {
                using (var sr = new BinaryReader(content))
                {
                    var bytes = sr.ReadBytes((int)content.Length);
                    return UploadFile(fileName, bytes);
                }

            }
            catch (Exception exp)
            {
                throw exp;
            }

        }
        void Callback(IAsyncResult ar)
        {

        }
        //public byte[] DownloadFile(string fineName)
        //{
        //    var container = new CloudBlobContainer(new Uri(CONNECTION_STRING));
        //    var blobRef = container.GetBlobReference(fineName) as CloudBlockBlob;
        //    using (var ms = new MemoryStream())
        //    {
        //        blobRef.DownloadToStream(ms);
        //        return ms.ToArray();
        //    }

        //}
    }
}