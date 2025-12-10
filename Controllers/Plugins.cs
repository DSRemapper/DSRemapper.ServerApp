using DSRemapper.Core;
using DSRemapper.Framework;
using Microsoft.AspNetCore.Mvc;

namespace DSRemapper.ServerApp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PluginsController : ControllerBase
    {
        [HttpGet]
        public ActionResult<IEnumerable<string>> GetPluginFiles() =>
            Ok(PluginLoader.GetPluginFiles());
        [HttpGet("input")]
        public ActionResult<IEnumerable<string>> GetInputPlugins() =>
            Ok(PluginLoader.Scanners.Keys);

        [HttpGet("output")]
        public ActionResult<IEnumerable<string>> GetOutputPlugins() =>
            Ok(PluginLoader.OutputPlugins.Keys);

        [HttpGet("remapper")]
        public ActionResult<IEnumerable<string>> GetORemapperPlugins() =>
            Ok(PluginLoader.RemapperPlugins.Keys);
    }
}