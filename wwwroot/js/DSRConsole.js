const LogLevel = {
    0: "Trace",
    1: "Debug",
    2: "Information",
    3: "Warning",
    4: "Error",
    5: "Critical",
    6: "None"
};

function formatLogEntry(entry) {
    const logLevelName = LogLevel[entry.logLevel] || "Unknown";
    const message = `${logLevelName}: [${entry.category} (${entry.eventId.id})] ${entry.message}`;
    // Create a text node to prevent HTML injection from the message content
    const textNode = document.createTextNode(message);
    const logElement = document.createElement(logLevelName);
    logElement.appendChild(textNode);
    return logElement;
}

function scrollToBottomIfEnabled() {
    const consoleView = document.getElementById("console-view");
    const autoScrollCheckbox = document.getElementById("auto-scroll-check");
    if (autoScrollCheckbox.checked) {
        consoleView.scrollTop = consoleView.scrollHeight;
    }
}

async function populateConsole(){
    const consoleView = document.getElementById("console-view");
    const response = await fetch("/api/console");
    //console.log(await response.text());
    const logs = await response.json();

    consoleView.innerHTML = "";

    for (const entry of logs) {
        const logElement = formatLogEntry(entry);
        consoleView.appendChild(logElement);
    }

    scrollToBottomIfEnabled();
}

document.addEventListener("DOMContentLoaded", async function () {
    await populateConsole();
    startSignalRConnection();

    const scrollButton = document.getElementById("scroll-to-end");
    const consoleView = document.getElementById("console-view");

    scrollButton.addEventListener("click", () => {
        consoleView.scrollTop = consoleView.scrollHeight;
    });
});

const connection = new signalR.HubConnectionBuilder()
    .withUrl("/dsrHub")
    .withAutomaticReconnect()
    .build();

connection.on("LogEvent",function (entry){
    const consoleView = document.getElementById("console-view");
    const logElement = formatLogEntry(entry);
    consoleView.appendChild(logElement);
    scrollToBottomIfEnabled();
});

connection.on("LogEvents", function (entries) {
    const consoleView = document.getElementById("console-view");
    //console.log(entries);
    const fragment = document.createDocumentFragment();
    for (const entry of entries) {
        fragment.appendChild(formatLogEntry(entry));
    }
    //console.log("log recived");
    consoleView.appendChild(fragment);
    scrollToBottomIfEnabled();
});

async function startSignalRConnection() {
    let params = new URLSearchParams(document.location.search);
    try {
        await connection.start();
        console.log(atob(params.get("id")));
        connection.invoke("JoinGroup", "ConsolePage")
            .catch(err => console.error(`Error al unirse al grupo IndexPage: ${err.toString()}`));
        console.log("SignalR Connected successfully.");
    } catch (err) {
        console.error("SignalR Connection Failed: ", err);
        setTimeout(startSignalRConnection, 5000); // Retry after 5 seconds
    }
}