
chrome.runtime.onMessage.addListener(
    async function (request, sender, sendResponse) {
        if (request.name === "start_game") {
            chrome.tabs.sendMessage(request.tab_id, { name: "start_engine", level: 0 });
            chrome.tabs.onUpdated.addListener(function (tab_id, change_info, tab) {
                if (tab_id === request.tab_id && change_info.status == "complete" && change_info.url !== "") {
                    chrome.tabs.sendMessage(tab_id, { name: "start_engine", level: 0 });
                }
            });
        }
    }
);
