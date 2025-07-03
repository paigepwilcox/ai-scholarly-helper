console.log("elo, how are you!!!");

function getArticle() {
    const abstract = document.querySelector('div.abstract-content.selected')?.innerText.trim();

    return abstract;
}

function applyAnalysisAsHighlights(analysis) {
    const textNodes = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,

    );

    let count = 0;
    // get the text and the parent conatiner 
    while (count < 40 || textNodes.nextNode()) {
        const node = textNodes.currentNode;
        const parent = node.parentNode;
        console.log("node", node);
        console.log("parent container", parent);
        count++;

        // if (!parent || parent.closest(".highlighted-term, .highlighted-method")) continue;


        }
}

function handleMessage(message, sender, sendResponse) {
    console.log("message received:", message);
    if (message.action === "getAll") {
        const abstract = document.querySelector('div.abstract-content.selected')?.innerText.trim(); // only targets abstract for now
        sendResponse({ abstract });
    }

    if (message.action === "applyHighlight") {
        console.log("hit");
        applyAnalysisAsHighlights(payload)
    }
}

// Listens for queue to send abstract text to popup.js via messaging
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("msg received");
    handleMessage(message, sender, sendResponse);
    return true;
})


