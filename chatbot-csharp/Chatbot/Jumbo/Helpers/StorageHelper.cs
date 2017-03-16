using Microsoft.WindowsAzure.Storage;
using Microsoft.WindowsAzure.Storage.Blob;
using System;
using System.Collections.Generic;
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
        public StorageHelper(string connectionString)
        {
            CONNECTION_STRING = connectionString.Replace("[si]","&si").Replace("[sr]","&sr").Replace("[sig]","&sig");
            SAS = CONNECTION_STRING.Split('?')[1];
        }

        public string UploadFile(String fileName, byte [] content)
        {
            try
            {
                var container = new CloudBlobContainer(new Uri(CONNECTION_STRING));
                var bbr = container.GetBlockBlobReference(fileName);
                bbr.UploadFromByteArray(content, 0, content.Length);

                return bbr.Uri.ToString() + "?" + SAS;
            }catch(Exception exp)
            {
                throw exp;
            }

        }

        public string UploadFile(String fileName, Stream content)
        {
            try
            {
                var container = new CloudBlobContainer(new Uri(CONNECTION_STRING));
                var bbr = container.GetBlockBlobReference(fileName);

                content.Seek(0, SeekOrigin.Begin);

                bbr.UploadFromStream(content);

                return bbr.Uri.ToString() + "?" + SAS;

            }
            catch(Exception exp)
            {
                throw exp;
            }

        }
        void Callback(IAsyncResult ar)
        {

        }
        public byte [] DownloadFile(string fineName)
        {
            var container = new CloudBlobContainer(new Uri(CONNECTION_STRING));
            var blobRef = container.GetBlobReference(fineName) as CloudBlockBlob;
            using (var ms = new MemoryStream())
            {
                blobRef.DownloadToStream(ms);
                return ms.ToArray();
            }

        }
    }
}