
const sixAxesScales = [1,1000,1,1]
function Clamp(x,min,max){
    return Math.max(min, Math.min(max, x))
};

const axisAlias=[
    ["LX"],
    ["LY"],
    ["RX"],
    ["RY"],
    ["LT"],
    ["RT"]
]
const buttonAlias=[
    ["A","Cross"],
    ["B","Circle"],
    ["X","Square"],
    ["Y","Triangle"],
    ["LB","L1"],
    ["RB","R1"],
    ["LT","L2"],
    ["RT","R2"],
    ["Back","Share"],
    ["Start","Options"],
    ["LS","L3"],
    ["RS","R3"],
    ["Guide","PS"],
    ["TouchPad"],
    ["Mute"]
]
const sixAxisAlias=[
    ["Raw Acceleration"],
    ["Gyroscope"],
    ["Gravity"],
    ["Acceleration"],
]
const quaternionAlias=[
    ["Delta Rotation"],
    ["Rotation"],
]

function getCssVariable(variableName) {
    const style = getComputedStyle(document.documentElement);
    return style.getPropertyValue(variableName).trim();
}

document.addEventListener("DOMContentLoaded", async function () {
    const batItem = document.getElementById("bat-info");
    batItem.querySelector('svg rect:first-child').setAttribute('fill', disableColor);
    batItem.querySelector('svg rect:nth-child(2)').setAttribute('fill', enableColor);
    startSignalRConnection();
});

const enableColor = getCssVariable('--font-placeholder');
const disableColor = getCssVariable('--bg-primary');
const semiDisableColor = getCssVariable('--bg-tertiary');

const connection = new signalR.HubConnectionBuilder()
    .withUrl("/dsrHub")
    .withAutomaticReconnect()
    .build();

connection.on("InputData",function (report){
    const testView = document.getElementById("input-test-view");
    
    if (document.getElementById("axis-0") == null) {
        console.log(report);
        const axisTile = document.getElementById("axis-template");
        const sliderTile = document.getElementById("slider-template");
        const buttonTile = document.getElementById("button-template");
        const povTile = document.getElementById("pov-template");
        const sixTile = document.getElementById("six-template");
        const quatTile = document.getElementById("quat-template");
        const touchTile = document.getElementById("touch-template");
        
        for(let i = 0; i < report.axes.length; i++){
            const clone = axisTile.content.cloneNode(true);
            const axisItem = clone.querySelector('.axis-item');
            axisItem.id = `axis-${i}`;
            axisItem.querySelector('svg rect:first-child').setAttribute('fill', disableColor);
            axisItem.querySelector('svg rect:nth-child(2)').setAttribute('fill', enableColor);
            clone.querySelector('span.name').innerHTML = `Axis ${i}<br>${axisAlias[i].join(" - ")}`;
            testView.appendChild(clone);
        }
        for(let i = 0; i < report.sliders.length; i++){
            const clone = sliderTile.content.cloneNode(true);
            const sliderItem = clone.querySelector('.slider-item');
            sliderItem.id = `slider-${i}`;
            sliderItem.querySelector('svg rect:first-child').setAttribute('fill', disableColor);
            sliderItem.querySelector('svg rect:nth-child(2)').setAttribute('fill', enableColor);
            clone.querySelector('span.name').innerText = `Slider ${i}`;
            testView.appendChild(clone);
        }
        for(let i = 0; i < report.povs.length; i++){
            const clone = povTile.content.cloneNode(true);
            const povItem = clone.querySelector('.pov-item');
            clone.querySelector('span.name').innerText = `POV ${i}`;
            povItem.id = `pov-${i}`;
            testView.appendChild(clone);
        }
        for(let i = 0; i < report.buttons.length; i++){
            const clone = buttonTile.content.cloneNode(true);
            const buttonItem = clone.querySelector('.button-item');
            clone.querySelector('span.name').innerHTML = `Button ${i}<br>${buttonAlias[i].join(" - ")}`;
            buttonItem.id = `button-${i}`;
            testView.appendChild(clone);
        }
        for(let i = 0; i < report.sixAxes.length; i++){
            const clone = sixTile.content.cloneNode(true);
            const sixItem = clone.querySelector('.six-item');
            sixItem.id = `six-${i}`;
            sixItem.querySelectorAll('svg rect:first-child').forEach(rect => {
                rect.setAttribute('fill', disableColor);
            });
            sixItem.querySelectorAll('svg rect:nth-child(2)').forEach(rect => {
                rect.setAttribute('fill', enableColor);
            });
            clone.querySelector('span.name').innerHTML = `SixAxis ${i}<br>${sixAxisAlias[i].join(" - ")}`;
            testView.appendChild(clone);
        }
        for(let i = 0; i < report.quaternions.length; i++){
            const clone = quatTile.content.cloneNode(true);
            const quatItem = clone.querySelector('.quat-item');
            quatItem.id = `quat-${i}`;
            quatItem.querySelectorAll('svg rect:first-child').forEach(rect => {
                rect.setAttribute('fill', disableColor);
            });
            quatItem.querySelectorAll('svg rect:nth-child(2)').forEach(rect => {
                rect.setAttribute('fill', enableColor);
            });
            clone.querySelector('span.name').innerHTML = `Quaternion ${i}<br>${quaternionAlias[i].join(" - ")}`;
            testView.appendChild(clone);
        }
        for(let i = 0; i < report.touch.length; i++){
            const clone = touchTile.content.cloneNode(true);
            const touchItem = clone.querySelector('.touch-item');
            touchItem.id = `touch-${i}`;
            touchItem.querySelector('svg rect:first-child').setAttribute('fill', disableColor);
            clone.querySelector('span.name').innerText = `Touch ${i}`;
            testView.appendChild(clone);
        }
    }

    //Update battry status
    const batItem = document.getElementById("bat-info");
    //const batItem = testView.querySelector("#bat-info");
    batItem.querySelector('svg rect:nth-child(2)').setAttribute('width', Clamp((report.battery) * 100,0,100));
    batItem.querySelector('span.value').innerText = `${report.charging ? "\u{1F5F2} ":""}${(report.battery * 100).toFixed(0)}%`;

    // Update axis values
    for (let i = 0; i < report.axes.length; i++) {
        const axisItem = document.getElementById(`axis-${i}`);
        if (axisItem) {
            // The second rect is the value indicator
            const valueRect = axisItem.querySelector('svg rect:nth-child(2)');
            // Assuming axis value is from -1 to 1, convert to 0-100 for width
            valueRect.setAttribute('width', Clamp((report.axes[i] + 1) * 50,0,100));
            // Update the text value
            axisItem.querySelector('span.value').innerText = report.axes[i].toFixed(3);
        }
    }

    // Update sliders values
    for (let i = 0; i < report.sliders.length; i++) {
        const sliderItem = document.getElementById(`slider-${i}`);
        if (sliderItem) {
            // The second rect is the value indicator
            const valueRect = sliderItem.querySelector('svg rect:nth-child(2)');
            // Assuming axis value is from -1 to 1, convert to 0-100 for width
            valueRect.setAttribute('width', Clamp((report.sliders[i] + 1) * 50,0,100));
            // Update the text value
            sliderItem.querySelector('span.value').innerText = report.sliders[i].toFixed(3);
        }
    }

    // Update POV states
    for (let i = 0; i < report.povs.length; i++) {
        const povItem = document.getElementById(`pov-${i}`);
        if (povItem) {
            const pov = report.povs[i];
            const polygons = povItem.querySelectorAll('svg polygon');

            polygons[0].setAttribute('fill', pov.up ? enableColor : disableColor);    // Up
            polygons[1].setAttribute('fill', pov.down ? enableColor : disableColor);  // Down
            polygons[2].setAttribute('fill', pov.left ? enableColor : disableColor);  // Left
            polygons[3].setAttribute('fill', pov.right ? enableColor : disableColor); // Right

            povItem.querySelector('span.value').innerText = pov.angle;
        }
    }

    // Update button states
    for (let i = 0; i < report.buttons.length; i++) {
        const buttonItem = document.getElementById(`button-${i}`);
        if (buttonItem) {
            const buttonRect = buttonItem.querySelector('svg rect');
            // Change color based on pressed state
            buttonRect.setAttribute('fill', report.buttons[i] ? enableColor : disableColor);
        }
    }

    // Update sixAxes states
    for (let i = 0; i < report.sixAxes.length; i++) {
        const sixItem = document.getElementById(`six-${i}`);
        if (sixItem) {
            // Use the scale for the current sixAxis, or default to 1 if out of bounds
            const scale = sixAxesScales[i] || 1;

            const sixAxis = report.sixAxes[i];
            const valueRects = sixItem.querySelectorAll('svg rect:nth-child(2)');
            const valueSpans = sixItem.querySelectorAll('span.value');

            valueRects[0].setAttribute('width', Clamp(50 + (sixAxis.x * 50) / scale,0,100));
            valueSpans[0].innerText = `X: ${sixAxis.x.toFixed(3)}`;
            valueRects[1].setAttribute('width', Clamp(50 + (sixAxis.y * 50) / scale,0,100));
            valueSpans[1].innerText = `Y: ${sixAxis.y.toFixed(3)}`;
            valueRects[2].setAttribute('width', Clamp(50 + (sixAxis.z * 50) / scale,0,100));
            valueSpans[2].innerText = `Z: ${sixAxis.z.toFixed(3)}`;
        }
    }

    //Update quaternions states
    for (let i = 0; i < report.quaternions.length; i++) {
        const quatItem = document.getElementById(`quat-${i}`);
        if (quatItem) {
            const quaternion = report.quaternions[i];
            const valueRects = quatItem.querySelectorAll('svg rect:nth-child(2)');
            const valueSpans = quatItem.querySelectorAll('span.value');

            valueRects[0].setAttribute('width', Clamp((quaternion.x + 1) * 25, 0, 50));
            valueSpans[0].innerText = quaternion.x.toFixed(3);
            valueRects[1].setAttribute('width', Clamp((quaternion.y + 1) * 25, 0, 50));
            valueSpans[1].innerText = quaternion.y.toFixed(3);
            valueRects[2].setAttribute('width', Clamp((quaternion.z + 1) * 25, 0, 50));
            valueSpans[2].innerText = quaternion.z.toFixed(3);
            valueRects[3].setAttribute('width', Clamp((quaternion.w + 1) * 25, 0, 50));
            valueSpans[3].innerText = quaternion.w.toFixed(3);
        }
    }

    // Update touchs states
    for (let i = 0; i < report.touch.length; i++) {
        const touchItem = document.getElementById(`touch-${i}`);
        if (touchItem) {
            const touch = report.touch[i];
            const circle = touchItem.querySelector('svg circle');
            const valueSpans = touchItem.querySelectorAll('span.value');

            // SVG is 100x60, pos is normalized (0-1)
            const cx = Clamp(touch.pos.x * 100, 0, 100);
            const cy = Clamp(touch.pos.y * 60, 0, 60);

            circle.setAttribute('cx', cx);
            circle.setAttribute('cy', cy);
            circle.setAttribute('fill', touch.pressed ? enableColor : semiDisableColor);

            valueSpans[0].innerText = `Id: ${touch.id}`;
            valueSpans[1].innerHTML = `X: ${touch.pos.x.toFixed(3)}<br>Y:${touch.pos.y.toFixed(3)}`;
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