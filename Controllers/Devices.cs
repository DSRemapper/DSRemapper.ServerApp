using DSRemapper.Core;
using DSRemapper.Framework;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Routing;
using Microsoft.Extensions.Logging;
using Microsoft.VisualBasic;
using System.Collections.Generic;
using System.Linq;

namespace DSRemapper.ServerApp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DevicesController : ControllerBase
    {
        static internal Remapper? GetRemapper(string id) => RemapperCore.Remappers.FirstOrDefault(d => d.Id.Equals(id));
        static internal IEnumerable<object> GetRemapperList() => RemapperCore.Remappers.Select(GetRemapperViewModel);
        static internal object GetRemapperViewModel(Remapper remapper)
        {
            RemapperConfig config = DSRConfigs.GetConfig(remapper.Id);
            return new
            {
                remapper.Id,
                remapper.Name,
                remapper.Type,
                remapper.Controller.ImgPath,
                remapper.IsConnected,
                remapper.IsRunning,
                remapper.CurrentProfile,
                config.AutoConnect,
                config.LastProfile,
            };
        }
        [HttpGet]
        public ActionResult<IEnumerable<string>> GetDevices() =>
            Ok(GetRemapperList());

        [HttpGet("{id}")]
        public ActionResult<string> GetDeviceById(string id) =>
            GetRemapper(id) is Remapper remapper ? Ok(GetRemapperViewModel(remapper)) : NotFound();

        [HttpGet("{id}/image")]
        public ActionResult<string> GetDeviceImage(string id) =>
            GetRemapper(id) is Remapper remapper ? Ok(PluginLoader.GetControllerImage(remapper.Controller)) : NotFound();

        [HttpGet("{id}/last-profile")]
        public ActionResult GetLastProfile(string id) => Ok(DSRConfigs.GetConfig(id).LastProfile);
        [HttpGet("{id}/profile")]
        public ActionResult GetProfile(string id) =>
            GetRemapper(id) is Remapper remapper ? Ok(remapper.CurrentProfile) : NotFound();

        [HttpPost("{id}/profile")]
        public ActionResult SetProfile(string id, [FromBody] string profile)
        {
            GetRemapper(id)?.SetProfile(profile ?? "");
            //DSRConfigs.SetLastProfile(id, profile ?? "");
            //Console.WriteLine($"=====[ {id} - {profile} ]=====");
            return Ok();
        }
    }
}
