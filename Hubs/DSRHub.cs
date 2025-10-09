using DSRemapper.Framework;
using Microsoft.AspNetCore.SignalR;

namespace DSRemapper.ServerApp.Hubs
{
    public class DSRHub : Hub
    {
        public async Task PerformControllerAction(string controllerId, string action)
        {
            switch (action)
            {
                case "connect":
                    RemapperCore.Remappers.Find((r) => r.Id == controllerId)?.Start();
                    Console.WriteLine($"Connect {controllerId}");
                    break;
                case "disconnect":
                    RemapperCore.Remappers.Find((r) => r.Id == controllerId)?.Stop();
                    Console.WriteLine($"Disconnect {controllerId}");
                    break;
                case "reload-profile":
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