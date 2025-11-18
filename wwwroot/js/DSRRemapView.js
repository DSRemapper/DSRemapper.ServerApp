document.addEventListener("DOMContentLoaded", function () {
    // You can use SignalR here to connect to the backend and receive updates.
    // const connection = new signalR.HubConnectionBuilder().withUrl("/dsr-hub").build();

    // connection.on("ReceiveInputLayout", (layout) => {
    //     populateRemapList(layout);
    // });

    // connection.on("ReceiveOutputDevices", (devices) => {
    //     populateOutputDeviceSelector(devices);
    // });

    // connection.on("ReceiveInputReport", (report) => {
    //     updateInputValues(report);
    // });

    // connection.start().then(() => {
    //     console.log("Connected to DSR hub for remap view.");
    //     // Request initial data
    //     // connection.invoke("GetInputLayout");
    //     // connection.invoke("GetOutputDevices");
    // }).catch(err => console.error(err.toString()));

    // For demonstration purposes, let's use mock data.
    const mockLayout = {
        Axes: ["LX", "LY", "RX", "RY"],
        Buttons: ["Cross", "Circle", "Square", "Triangle", "L1", "R1"]
    };
    const mockOutputDevices = ["ViGEmBus Xbox 360", "ViGEmBus DS4"];
    const mockOutputOptions = ["None", "LX", "LY", "RX", "RY", "A", "B", "X", "Y", "LB", "RB"];

    populateOutputDeviceSelector(mockOutputDevices);
    populateRemapList(mockLayout, mockOutputOptions);
});

function populateOutputDeviceSelector(devices) {
    const select = document.getElementById("output-device-list");
    select.innerHTML = "";
    devices.forEach(device => {
        const option = document.createElement("option");
        option.value = device;
        option.textContent = device;
        select.appendChild(option);
    });
}

function populateRemapList(layout, outputOptions) {
    const list = document.getElementById("remap-list");
    const template = document.getElementById("remap-item-template");
    list.innerHTML = "";

    const createItem = (name) => {
        const clone = template.content.cloneNode(true);
        const nameSpan = clone.querySelector(".name");
        const outputSelect = clone.querySelector(".output-selector");

        nameSpan.textContent = name;

        outputOptions.forEach(opt => {
            const option = document.createElement("option");
            option.value = opt;
            option.textContent = opt;
            outputSelect.appendChild(option);
        });

        list.appendChild(clone);
    };

    if (layout.Axes) {
        layout.Axes.forEach(axis => createItem(`Axis: ${axis}`));
    }
    if (layout.Buttons) {
        layout.Buttons.forEach(button => createItem(`Button: ${button}`));
    }
}

function updateInputValues(report) {
    // This function would update the indicators and value spans for each input
    // based on the real-time report from the controller.
    // For example:
    // const lxValue = report.Axes[0];
    // const lxItem = document.querySelector(...);
    // lxItem.querySelector('.indicator').style.width = `${(lxValue + 1) * 50}%`;
    // lxItem.querySelector('.value').textContent = lxValue.toFixed(2);
}