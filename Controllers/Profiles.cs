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
    public class ProfilesController : ControllerBase
    {
        [HttpGet]
        public ActionResult<IEnumerable<string>> GetProfiles() =>
            Ok(ProfileManager.GetProfiles());
    }
}