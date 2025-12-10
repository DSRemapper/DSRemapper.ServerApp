using DSRemapper.Core;
using DSRemapper.Framework;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Net.Http.Headers;
using Microsoft.Extensions.Logging;
using System.Collections.Generic;
using System.Linq;

namespace DSRemapper.ServerApp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ImagesController : ControllerBase
    {
        [HttpGet]
        public ActionResult<IEnumerable<string>> GetImages() =>
            Ok(PluginLoader.ControllerImages);

        [HttpGet("raw/{*id}")]
        public ActionResult<byte[]> GetImageById(string id) =>
            PluginLoader.ControllerImages.TryGetValue(id, out byte[]? val) ?
                File(val, "image/png") :
                Redirect("/Images/UnknownController.png");

        [HttpGet("base64/{*id}")]
        public ActionResult GetImageByIdBase64(string id) =>
            PluginLoader.ControllerImages.TryGetValue(id, out byte[]? val) ?
                Ok(Convert.ToBase64String(val)) :
                NotFound();
    }
}