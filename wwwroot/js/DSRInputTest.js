
document.addEventListener("DOMContentLoaded", async function () {
    startSignalRConnection();
});

const connection = new signalR.HubConnectionBuilder()
    .withUrl("/dsrHub")
    .withAutomaticReconnect()
    .build();

connection.on("InputData",function (report){
    const testView = document.getElementById("input-test-view");
    
    if (document.getElementById("axis-0") == null) {
        console.log(report);
        const axisTile = document.getElementById("axis-template");
        const buttonTile = document.getElementById("button-template");
        const povTile = document.getElementById("pov-template");
        for(let i = 0; i < report.axes.length; i++){
            const clone = axisTile.content.cloneNode(true);
            const axisItem = clone.querySelector('.axis-item');
            axisItem.id = `axis-${i}`;
            clone.querySelector('.axis-item').firstElementChild.innerText = `Axis ${i}`;
            testView.appendChild(clone);
        }
        for(let i = 0; i < report.povs.length; i++){
            const clone = povTile.content.cloneNode(true);
            const povItem = clone.querySelector('.pov-item');
            clone.querySelector('.pov-item').firstElementChild.innerText = `POV ${i}`;
            povItem.id = `pov-${i}`;
            testView.appendChild(clone);
        }
        for(let i = 0; i < report.buttons.length; i++){
            const clone = buttonTile.content.cloneNode(true);
            const buttonItem = clone.querySelector('.button-item');
            clone.querySelector('.button-item').firstElementChild.innerText = `Button ${i}`;
            buttonItem.id = `button-${i}`;
            testView.appendChild(clone);
        }
    }

    // Update axis values
    for (let i = 0; i < report.axes.length; i++) {
        const axisItem = document.getElementById(`axis-${i}`);
        if (axisItem) {
            // The second rect is the value indicator
            const valueRect = axisItem.querySelector('svg rect:nth-child(2)');
            // Assuming axis value is from -1 to 1, convert to 0-100 for width
            valueRect.setAttribute('width', (report.axes[i] + 1) * 50);
            // Update the text value
            axisItem.querySelector('span:last-of-type').innerText = report.axes[i].toFixed(3);
        }
    }

    // Update button states
    for (let i = 0; i < report.buttons.length; i++) {
        const buttonItem = document.getElementById(`button-${i}`);
        if (buttonItem) {
            const buttonRect = buttonItem.querySelector('svg rect');
            // Change color based on pressed state
            buttonRect.setAttribute('fill', report.buttons[i] ? '#aaa' : '#282828');
        }
    }
});

async function startSignalRConnection() {
    let params = new URLSearchParams(document.location.search);
    try {
        await connection.start();
        console.log(atob(params.get("id")));
        connection.invoke("JoinGroup", `ctrl-${atob(params.get("id"))}`)
            .catch(err => console.error(`Error al unirse al grupo IndexPage: ${err.toString()}`));
        console.log("SignalR Connected successfully.");
    } catch (err) {
        console.error("SignalR Connection Failed: ", err);
        setTimeout(startSignalRConnection, 5000); // Retry after 5 seconds
    }
}