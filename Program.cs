using DSRemapper.Framework;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using DSRemapper.Core;
using DSRemapper.ServerApp.Hubs;
using DSRemapper.Core.Loggers;
using Microsoft.AspNetCore.SignalR;
using DSRemapper.ServerApp.Controllers;
using System.Collections.Concurrent;

namespace DSRemapper.ServerApp
{
    internal class Program
    {
        private static readonly ConcurrentDictionary<string, DateTimeOffset> LastSentTimes = new();
        private static readonly TimeSpan ThrottleInterval = TimeSpan.FromSeconds(1/20);
        static void Main(string[] args)
        {
            IHubContext<DSRHub>? dsrHubContext = null;

            //ILoggerFactory logFac = LoggerFactory.Create(builder => builder.AddProvider(new ConsoleLoggerProvider()));

            WebApplicationBuilder builder = WebApplication.CreateBuilder(args);

            builder.Logging.ClearProviders();
            builder.Logging.AddProvider(new ConsoleLoggerProvider());
            builder.Logging.SetMinimumLevel(LogLevel.Information);
            builder.Services.AddControllers();
            builder.Services.AddSignalR();
            
            builder.Services.Configure<HostOptions>(options =>
            {
                options.ShutdownTimeout = TimeSpan.FromSeconds(1);
            });

            WebApplication app = builder.Build();
            ILogger<Program> logger = app.Services.GetRequiredService<ILogger<Program>>();//logFac.CreateLogger<Program>();

            logger.LogInformation("Loading DSRemapper Framework...");
            AppDomain.CurrentDomain.UnhandledException += (sender, e) =>
            {
                Exception? exception = (Exception?)e.ExceptionObject;
                string msg = $"{sender?.GetType().FullName}: {exception?.Message}";
                DSRLogger.StaticLogCritical(msg);
                logger.LogCritical(msg);
            };

            PluginLoader.LoadPluginAssemblies();
            PluginLoader.LoadPlugins();
            logger.LogInformation("DSRemapper Framework loaded.");


            IHostApplicationLifetime lifetime = app.Services.GetRequiredService<IHostApplicationLifetime>();
            lifetime.ApplicationStopping.Register(() =>
            {
                logger.LogInformation("Stopping DSRemapper Framework...");
                RemapperCore.Stop();
                PluginLoader.FreeAllPlugins();
                logger.LogInformation("DSRemapper Framework stopped.");
            });

            logger.LogInformation("Configuring server endpoints");

            app.UseDefaultFiles();
            app.UseStaticFiles();
            /*app.UseStaticFiles(new StaticFileOptions
            {
                OnPrepareResponse = ctx =>
                {
                    ctx.Context.Response.Headers.Append("Cache-Control", "no-cache, no-store, must-revalidate");
                    ctx.Context.Response.Headers.Append("Pragma", "no-cache");
                    ctx.Context.Response.Headers.Append("Expires", "0");
                }
            });*/
            app.MapControllers();
            app.MapHub<DSRHub>("/dsrHub");

            app.MapGet("/api/exit", () => lifetime.StopApplication());

            logger.LogInformation("Starting server on http://localhost:5100");


            dsrHubContext = app.Services.GetRequiredService<IHubContext<DSRHub>>();

            RemapperCore.OnUpdate += async () =>
            {
                if (dsrHubContext != null)
                {
                    logger.LogInformation("Device list updated, notifying clients.");

                    await dsrHubContext.Clients.Group("IndexPage").SendAsync("DevicesUpdated", DevicesController.GetRemapperList());
                }
            };
            Remapper.OnDeviceInfo += async (id, info) =>
            {
                //Console.WriteLine($"{id}: {info}");
                await dsrHubContext.Clients.Group("IndexPage").SendAsync("DeviceInfo", new { id, info});
            };
            Remapper.OnGlobalDeviceConsole += async (id, message, level) =>
            {
                //Console.WriteLine($"{id}: {message}");
                await dsrHubContext.Clients.Group("IndexPage").SendAsync("DeviceConsole", new { id, message, level });
            };
            Remapper.OnGlobalRead += async (id, report) =>
            {
                var currentTime = DateTimeOffset.UtcNow;
                DateTimeOffset lastSendTime = LastSentTimes.GetOrAdd(id, currentTime);
                var timeSinceLastSend = currentTime - lastSendTime;
                if (timeSinceLastSend >= ThrottleInterval)
                {
                    await dsrHubContext.Clients.Group($"ctrl-{id}").SendAsync("InputData", report);

                    LastSentTimes.TryUpdate(id, currentTime, lastSendTime);
                }
            };

            int lastLogCount = 0;
            var logTimer = new Timer(async _ =>
            {
                if (dsrHubContext != null)
                {
                    var currentLogCount = DSRLogger.Entries.Count;
                    if (currentLogCount > lastLogCount)
                    {
                        var logsToSend = DSRLogger.Entries[lastLogCount..currentLogCount].Select(log => new { log.logLevel, log.eventId, log.category, log.message });//.GetRange(lastLogCount, currentLogCount - lastLogCount);
                        await dsrHubContext.Clients.Group("ConsolePage").SendAsync("LogEvents", logsToSend);
                        lastLogCount = currentLogCount;
                    }
                }
            }, null, TimeSpan.Zero, TimeSpan.FromMilliseconds(100));

            RemapperCore.StartScanner();
            app.Run("http://*:5100");
        }
    }
}
