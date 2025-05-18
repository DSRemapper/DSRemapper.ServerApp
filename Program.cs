using System.Net.Mime;
using System.Text.Json;
using FireLibs.Web.Http;
using Microsoft.Extensions.Logging;

namespace DSRemapper.ServerApp
{
    internal class Program
    {
        static ILoggerFactory logFac = LoggerFactory.Create((builder) =>
            builder.SetMinimumLevel(LogLevel.Debug).AddProvider(new EventLoggerProvider()));

        static ILogger logger = logFac.CreateLogger("MainProgram");

        static HttpServer MainServer = new(5100, 60000, logFac.CreateLogger<HttpServer>());
        static bool run = true;

        static readonly string wwwrootPath = Path.GetFullPath("./wwwroot");

        static Dictionary<string, string> Devices = new()
        {
            {"id1", "test1" },
            {"id2", "test2" },
            {"id3", "test3" },
            {"id4", "test4" },
        };

        static void Main(string[] args)
        {
            logger.LogInformation("Configuring server");
            AppDomain.CurrentDomain.DomainUnload += ProcessExit;
            MainServer.OnProcessRequest = MainServer_RequestHandler;

            MainServer.MapGet("/devices",(req, opts)=>
            {
                if (opts.Length == 0)
                    return new(HttpDefaultStatus.OK, [],
                        JsonSerializer.Serialize(Devices.Keys),
                        MediaTypeNames.Application.Json);
                if(Devices.TryGetValue(opts[0], out var dev))
                    return new(HttpDefaultStatus.OK, [],
                        JsonSerializer.Serialize(dev),
                        MediaTypeNames.Application.Json);

                return HttpResponse.NotFoundResponse;
            });

            logger.LogInformation("Starting server");
            MainServer.Start();

            while (run) ;
        }

        private static void ProcessExit(object? sender, EventArgs e)
        {
            MainServer.Stop();
        }

        static HttpResponse MainServer_RequestHandler(HttpRequest request){
            HttpResponse response = new(HttpDefaultStatus.OK,[],"");
            
            if(request.Path == "/exit.exit")
                run = false;
            else if(request.IsOperation("GET")){
                string fullPath = Path.GetFullPath(Path.Combine(wwwrootPath, request.Path[1..]));
                //Console.WriteLine($"{wwwrootPath} | {fullPath}");
                if (!fullPath.StartsWith(wwwrootPath))
                    return new(HttpDefaultStatus.Forbidden, [], "");

                if (!File.Exists(fullPath))
                    return new(HttpDefaultStatus.NotFound, [], "");

                response.SetContentFromFile(fullPath);
                return response;
            }

            return HttpResponse.NotImplementedResponse;
        }
    }
}
