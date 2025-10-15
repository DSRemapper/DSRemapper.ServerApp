using DSRemapper.Framework;
using Microsoft.AspNetCore.SignalR;

namespace DSRemapper.ServerApp.Hubs
{
    public class DSRHub : Hub
    {
        public async Task PerformControllerAction(string controllerId, string action)
        {
            Remapper? remapper = RemapperCore.Remappers.Find((r) => r.Id == controllerId);
            switch (action)
            {
                case "connect":
                    remapper?.Start();
                    Console.WriteLine($"Connect {controllerId}");
                    break;
                case "disconnect":
                    remapper?.Stop();
                    Console.WriteLine($"Disconnect {controllerId}");
                    break;
                case "reload-profile":
                    remapper?.ReloadProfile();
                    Console.WriteLine($"Reload Profile {controllerId}");
                    break;
                case "input-test":
                    Console.WriteLine($"Input Test {controllerId}");
                    break;
                default:
                    Console.WriteLine($"Acción desconocida: {action}");
                    break;
            }
        }
    }
}