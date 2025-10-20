using DSRemapper;
using Microsoft.AspNetCore.Mvc;

namespace DSRemapper.ServerApp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ConsoleController : ControllerBase
    {
        [HttpGet]
        public IActionResult GetLogs() =>
            Ok(DSRLogger.Entries.Select(log => new { log.logLevel, log.eventId, log.category, log.message }));
    }
}