using DSRemapper.Core;
using DSRemapper.Framework;
using Microsoft.AspNetCore.Mvc;
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

        [HttpGet("{id}")]
        public ActionResult<byte[]> GetImageById(string id) =>
            PluginLoader.ControllerImages.TryGetValue(id, out byte[]? val) ? Ok(val) : NotFound();
        [HttpGet("{id}/base64")]
        public ActionResult GetImageByIdBase64(string id) =>
            PluginLoader.ControllerImages.TryGetValue(id, out byte[]? val) ? Ok(Convert.ToBase64String(val)) : NotFound();
    }
}