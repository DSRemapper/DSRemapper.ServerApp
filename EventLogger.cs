using Microsoft.Extensions.Logging;

namespace DSRemapper.ServerApp
{
    public class EventLogger : ILogger
    {
        private object _lock = new();
        private string Category { get; set; }
        public EventLogger(string category)
        {
            Category = category;
        }
        public IDisposable? BeginScope<TState>(TState state) where TState : notnull
        {
            return null;
        }

        public bool IsEnabled(LogLevel logLevel) => true;

        public void Log<TState>(LogLevel logLevel, EventId eventId, TState state, Exception? exception, Func<TState, Exception?, string> formatter)
        {
            lock (_lock)
            {
                ConsoleColor prevColor = Console.ForegroundColor;
                Console.ForegroundColor = logLevel switch {
                    LogLevel.Information => ConsoleColor.DarkGreen,
                    LogLevel.Warning => ConsoleColor.Yellow,
                    LogLevel.Error => ConsoleColor.Red,
                    LogLevel.Critical => ConsoleColor.DarkRed,
                    _ => ConsoleColor.White,
                };
                Console.Write($"{logLevel}:");
                Console.ForegroundColor = prevColor;
                Console.WriteLine($" [{Category} ({eventId})] {formatter(state, exception)}");
            }
        }
    }

    public class EventLoggerProvider : ILoggerProvider
    {
        public ILogger CreateLogger(string categoryName) => new EventLogger(categoryName);

        public void Dispose() { }
    }
}