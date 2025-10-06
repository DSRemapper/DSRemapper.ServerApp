async function hidePluginsPanel(){
    document.getElementById("app").classList.toggle("hide-side-panel");
}

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

        clone.querySelector(".ctrl-img img").src = device.image;
        clone.querySelector(".ctrl-title").textContent =`[${device.type}] ${device.name}`;
        //clone.querySelector(".ctrl-info").textContent = device.status;
        //clone.querySelector(".ctrl-bbar input[type='checkbox']").checked = device.autoConnect;
                
        ctrlItem.addEventListener('click', (event) => {
            // Nos aseguramos de que el clic fue en un botón con data-action
            const button = event.target.closest('button[data-action]');
            
            if (!button) return;
            const action = button.dataset.action;
            const controllerId = ctrlItem.dataset.deviceId;
            
            console.log(`${controllerId} - ${action}`);
            if (action && controllerId) {
                console.log(`Enviando acción '${action}' para el controlador '${controllerId}'`);
                connection.invoke("PerformControllerAction", controllerId, action)
                    .catch(err => console.error(`Error al invocar PerformControllerAction: ${err.toString()}`));
            }
        });

        const profileSelector = clone.querySelector('.profile-selector');
        profileSelector.addEventListener('change', async (event) => {
            const selectedProfile = event.target.value;
            const deviceId = ctrlItem.dataset.deviceId;

            if (deviceId) {
                await setDeviceProfile(deviceId, selectedProfile);
            }
        });

        mainView.appendChild(clone);
    }

    // Ahora que todos los <select> de los controladores están en el DOM, los poblamos.
    populateProfiles();
}

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

document.addEventListener("DOMContentLoaded", async function () {
    startSignalRConnection();
    await populateControllers();
});

const connection = new signalR.HubConnectionBuilder()
    .withUrl("/dsrHub")
    .withAutomaticReconnect()
    .build();

connection.on("DevicesUpdated", function (devices) {
    console.log("Device update notification received with new device list. Rendering...");
    renderControllers(devices);
});

// Start the connection and handle potential errors
async function startSignalRConnection() {
    try {
        await connection.start();
        console.log("SignalR Connected successfully.");
    } catch (err) {
        console.error("SignalR Connection Failed: ", err);
        setTimeout(startSignalRConnection, 5000); // Retry after 5 seconds
    }
}