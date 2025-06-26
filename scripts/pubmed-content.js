const abstract = document.querySelector('div.abstract-content.selected')?.innerText.trim();

console.log("abstract:", abstract);
console.log("elo");

// const hosturl = ""

// fetching all 
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log("msg received");
    if (request.action === "getAll") {
        const abstract = document.querySelector('div.abstract-content.selected')?.innerText.trim();
        sendResponse({ abstract });
    }

    return true;
})
