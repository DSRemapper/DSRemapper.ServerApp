using DSRemapper.Framework;
using DSRemapper.ServerApp.Controllers;
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
                    //Console.WriteLine($"Connect {controllerId}");
                    break;
                case "disconnect":
                    remapper?.Stop();
                    //Console.WriteLine($"Disconnect {controllerId}");
                    break;
                case "reload-profile":
                    remapper?.ReloadProfile();
                    //Console.WriteLine($"Reload Profile {controllerId}");
                    break;
                default:
                    if (DevicesController.GetRemapper(controllerId)?.CustomActions.TryGetValue(action, out var act) ?? false)
                    {
                        try
                        {
                            act.Invoke();
                        }
                        catch (Exception e)
                        {
                            DSRLogger.StaticLogError(e.ToString());
                        }
                    }
                    else
                        Console.WriteLine($"Acción desconocida: {action}");
                    break;
            }
        }
        public async Task JoinGroup(string groupId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, groupId);
        }
    }
}