async function hidePluginsPanel(){
    document.getElementById("app").classList.toggle("hide-side-panel");
}

// Opens Control Panel Windows Game Devices window
async function openWindowsDevices() {
    try {
        const response = await fetch("/api/utils/windows-devices");
        if (!response.ok) {
            console.error("Failed to open Windows devices panel:", await response.text());
        }
    } catch (error) {
        console.error("Error calling openWindowsDevices endpoint:", error);
    }
}

function openDebugConsole(){
    window.open("/console.html", "_blank");
}

// Renders the list of controllers
function renderControllers(devices) {
    const mainView = document.getElementById("main-view");
    const template = document.getElementById("controller-template");

    if (!mainView || !template) {
        console.error("Required elements #main-view or #controller-template not found.");
        return;
    }
    mainView.innerHTML = ""; // Limpia el contenido anterior

    for (const device of devices) {
        const clone = template.content.cloneNode(true);
        const ctrlItem = clone.querySelector(".ctrl-item");

        // Asigna un ID único y un atributo de datos al elemento del controlador
        ctrlItem.id = `ctrl-${device.id.replace(/[^a-zA-Z0-9-_]/g, '_')}`; // Sanitiza el ID
        ctrlItem.dataset.deviceId = device.id;

        clone.querySelector(".ctrl-img img").src = `/api/images/raw/${device.imgPath}`;
        clone.querySelector(".ctrl-title").textContent =`[${device.type}] ${device.name}`;
                
        ctrlItem.addEventListener('click', (event) => {
            const button = event.target.closest('button[data-action]');
            
            if (!button) return;
            const action = button.dataset.action;
            const controllerId = ctrlItem.dataset.deviceId;
            
            //console.log(`${controllerId} - ${action}`);
            if (action == "input-test"){
                window.open(`/inputTest.html?id=${btoa(device.id)}`, "_blank");
            }
            if (action && controllerId) {
                //console.log(`Enviando acción '${action}' para el controlador '${controllerId}'`);
                connection.invoke("PerformControllerAction", controllerId, action)
                    .catch(err => console.error(`Error al invocar PerformControllerAction: ${err.toString()}`));
            }
        });

        const buttonBar = clone.querySelector('.ctrl-bbar');
        if (device.customActions && buttonBar) {
            for (const actionName of device.customActions) {
                const button = document.createElement('button');
                button.dataset.action = actionName;
                button.innerText = actionName;
                // Prepend the button to the bar
                buttonBar.appendChild(button, buttonBar.firstChild);
            }
        }

        const profileSelector = clone.querySelector('.profile-selector');
        profileSelector.addEventListener('change', async (event) => {
            const selectedProfile = event.target.value;
            const deviceId = ctrlItem.dataset.deviceId;

            if (deviceId) {
                await setDeviceProfile(deviceId, selectedProfile);
            }
        });
        const autoConnectCheckbox = clone.querySelector('.ctrl-auto-connect');
        autoConnectCheckbox.checked = device.autoConnect;
        autoConnectCheckbox.addEventListener('change', async (event) => {
            const autoConnect = event.target.checked;
            const deviceId = ctrlItem.dataset.deviceId;

            if (deviceId) {
                await setDeviceAutoConnect(deviceId, autoConnect);
            }
        });

        


        mainView.appendChild(clone);
    }

    populateProfiles();
}

// Populates the list of controllers
async function populateControllers() {
    try {
        const response = await fetch("/api/devices");
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const devices = await response.json();
        renderControllers(devices);
    } catch (error) {
        console.error("Error fetching or populating controllers:", error);
        const mainView = document.getElementById("main-view");
        if(mainView)
            mainView.innerHTML = `<div class="error-message">Failed to load controllers.</div>`;
    }
}

// Populates the lists of profiles inside the controllers
async function populateProfiles() {
    try {
        const response = await fetch("/api/profiles");
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const profiles = await response.json();

        const profileElements = document.querySelectorAll(
            "select.profile-selector"
        );

        profileElements.forEach(async (element) => {
            element.innerHTML = "";
            const defaultOption = document.createElement("option");
            defaultOption.value = "";
            defaultOption.textContent = "None - Select Profile";
            defaultOption.selected = true;
            element.appendChild(defaultOption);

            const deviceId = element.closest(".ctrl-item").dataset.deviceId;

            const lastProfileReq = await fetch(`/api/devices/${deviceId}/last-profile`);
            let lastProfile = ""
            if (lastProfileReq.ok) {
                lastProfile = await lastProfileReq.text();
                console.log(`${deviceId} - ${lastProfile}`);
            }
            
            profiles.forEach((profile) => {
                const option = document.createElement("option");
                option.value = profile;
                option.textContent = profile;
                if (profile === lastProfile) {
                    option.selected = true;
                }
                element.appendChild(option);
                });
            });
    } catch (error) {
        console.error("Error fetching profiles:", error);
    }
}

// Sends a post request to set the current profile of the controller
async function setDeviceProfile(deviceId, profileName) {
    try {
        const response = await fetch(`/api/devices/${deviceId}/profile`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            // Enviamos el nombre del perfil como un string JSON en el cuerpo
            body: JSON.stringify(profileName)
        });

        if (!response.ok) {
            console.error(`Failed to set profile for ${deviceId}:`, await response.text());
        } else {
            console.log(`Successfully set profile '${profileName}' for device '${deviceId}'.`);
        }
    } catch (error) {
        console.error(`Error setting profile for ${deviceId}:`, error);
    }
}
// Sends a post request to set the auto connect config of the controller
async function setDeviceAutoConnect(deviceId, autoConnect) {
    try {
        const response = await fetch(`/api/devices/${deviceId}/autoconnect`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            // Enviamos el nombre del perfil como un string JSON en el cuerpo
            body: JSON.stringify(autoConnect)
        });

        if (!response.ok) {
            console.error(`Failed to set auto connect for ${deviceId}:`, await response.text());
        } else {
            console.log(`Successfully set auto connect '${autoConnect}' for device '${deviceId}'.`);
        }
    } catch (error) {
        console.error(`Error setting auto connect for ${deviceId}:`, error);
    }
}

// Waits until the page is loaded to connect to SignalR and to populate the controllers
document.addEventListener("DOMContentLoaded", async function () {
    startSignalRConnection();
    await populateControllers();
});

// Connection to the SignalR hub on the server
const connection = new signalR.HubConnectionBuilder()
    .withUrl("/dsrHub")
    .withAutomaticReconnect()
    .build();

// Event listener for devices update from dsrHub
connection.on("DevicesUpdated", function (devices) {
    console.log("Device update notification received with new device list. Rendering...");
    renderControllers(devices);
});

// Event listener for the device info update from dsrHub
connection.on("DeviceInfo", function (args) {
    if (args.info !== undefined) {
        const ctrlItem = document.querySelector(`.ctrl-item[data-device-id="${args.id}"]`);
        if (ctrlItem) {
            const infoDiv = ctrlItem.querySelector('.ctrl-info');
            if (infoDiv) {
                infoDiv.textContent = args.info;
            }
        }
    }
});
// Event listener for the device console update from dsrHub
connection.on("DeviceConsole", function (args) {
    if (args.message !== undefined) {
        const ctrlItem = document.querySelector(`.ctrl-item[data-device-id="${args.id}"]`);
        if (ctrlItem) {
            const consoleDiv = ctrlItem.querySelector('.ctrl-console');
            if (consoleDiv) {
                //console.log(args.level);
                if (args.level == 6)
                    consoleDiv.textContent = args.message;
                else {
                    consoleDiv.innerHTML = "";
                    const errorTag = document.createElement("error");
                    errorTag.textContent = args.message;
                    consoleDiv.appendChild(errorTag);
                }
            }
        }
    }
});

// Start the connection and handle potential errors
async function startSignalRConnection() {
    try {
        await connection.start();
        connection.invoke("JoinGroup","IndexPage")
            .catch(err => console.error(`Error al unirse al grupo IndexPage: ${err.toString()}`));
        console.log("SignalR Connected successfully.");
    } catch (err) {
        console.error("SignalR Connection Failed: ", err);
        setTimeout(startSignalRConnection, 5000); // Retry after 5 seconds
    }
}