using DSRemapper.Core;
using DSRemapper.Core.CDN;
using DSRemapper.Framework;
using Microsoft.AspNetCore.Mvc;

namespace DSRemapper.ServerApp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PluginsController : ControllerBase
    {
        [HttpGet]
        public ActionResult<IEnumerable<string>> GetPlugins() =>
            Ok(PluginLoader.GetPluginFiles.Select(f => f.FullName));
        [HttpGet("input")]
        public ActionResult<IEnumerable<string>> GetInputPlugins() =>
            Ok(PluginLoader.Scanners.Keys);

        [HttpGet("output")]
        public ActionResult<IEnumerable<string>> GetOutputPlugins() =>
            Ok(PluginLoader.OutputPlugins.Keys);

        [HttpGet("remapper")]
        public ActionResult<IEnumerable<string>> GetRemapperPlugins() =>
            Ok(PluginLoader.RemapperPlugins.Keys);
        [HttpGet("core")]
        public ActionResult<IEnumerable<Version>> GetCoreVersion() =>
            Ok(PluginLoader.CoreVersion);
        [HttpGet("framework")]
        public ActionResult<IEnumerable<Version>> GetFrameworkVersion() =>
            Ok(PluginLoader.FrameworkVersion);
    }
}