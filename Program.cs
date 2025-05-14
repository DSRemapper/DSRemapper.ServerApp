using System.Formats.Asn1;
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
        static void Main(string[] args)
        {
            logger.LogInformation("Configuring server");
            AppDomain.CurrentDomain.DomainUnload += ProcessExit;
            MainServer.OnProcessRequest = MainServer_RequestHandler;


            logger.LogInformation("Configuring server");
            MainServer.Start();
            
            while(run);
        }

        private static void ProcessExit(object? sender, EventArgs e)
        {
            MainServer.Stop();
        }

        static Dictionary<string,Dictionary<string,Func<HttpRequest,string,HttpResponse>>> registeredOperations = new(){
            {"GET", new(){
                {"/devices", (req,path)=>{
                    return HttpResponse.NotImplementedResponse;
                }},
            }},
        };

        static HttpResponse MainServer_RequestHandler(HttpRequest request){
            HttpResponse response = new(HttpDefaultStatus.OK,[],"");
            
            if(request.Path == "/exit.exit"){
                run = false;
            }
            else if(request.IsOperation("GET")){
                response.SetContent("This is a test");
                return response;
            }

            return HttpResponse.NotImplementedResponse;
        }
    }
}
