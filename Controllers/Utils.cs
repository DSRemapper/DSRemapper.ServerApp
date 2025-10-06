using DSRemapper.Core;
using DSRemapper.Framework;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System.Diagnostics;
using System.Collections.Generic;
using System.Linq;

namespace DSRemapper.ServerApp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UtilsController : ControllerBase
    {
        [HttpGet("windows-devices")]
        public IActionResult ShowWindowsDevices()
        {
            try
            {
                Process.Start(new ProcessStartInfo("joy.cpl") { UseShellExecute = true });
                return Ok("joy.cpl executed successfully.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error executing joy.cpl: {ex.Message}");
            }
        }
    }
}