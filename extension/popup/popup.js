// Starts the game in the currently active tab by sending a message to it.
async function sendStartMessage() {
    const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
    await chrome.runtime.sendMessage({ name: "start_game", tab_id: tab.id });
}

async function hasEngineStarted() {
    const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
    const response = await chrome.tabs.sendMessage(tab.id, { name: "has_engine_started" });
    return response;
}

// Animates the plumber entering the pipe

hasEngineStarted().then((has_engine_started) => {
    let plumber_entered_pipe = has_engine_started;
    if (plumber_entered_pipe !== true) {
        plumber_entered_pipe = false;
    }

    document.body.onclick = () => {
        if (plumber_entered_pipe) {
            return;
        }
        plumber_entered_pipe = true;
        sendStartMessage();
    };

    const plumber = document.getElementById("plumber");

    const plumber_y = 64;
    const warp_height = plumber_y + 32 + 1;

    let y = plumber_y;

    if (plumber_entered_pipe) {
        y = warp_height;
    }

    setInterval(() => {
        if (!plumber_entered_pipe) {
            return;
        }

        y += 0.2;
        plumber.style.top = `${y}px`;
        if (y > warp_height) {
            y = warp_height;
        }
    }, 1);
})

// Animates the background cloud

{
    const cloud = document.getElementById("cloud");
    const popup_width = 192;
    const cloud_width = 96;
    const extra_margin = cloud_width;
    let x = Math.random() * (popup_width + cloud_width + extra_margin) - cloud_width;

    cloud.style.left = `${x}px`;
    cloud.style.top = `${Math.random() * 48 - 16}px`;

    setInterval(() => {
        x += 0.1;
        cloud.style.left = `${x}px`;
        if (x > popup_width + extra_margin) {
            x = -cloud_width;
            cloud.style.top = `${Math.random() * 48 - 16}px`;
        }
    }, 1);
}
