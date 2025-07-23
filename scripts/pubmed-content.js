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
    const textNodesArray = [];

    while (textNodes.nextNode()) {
        textNodesArray.push(textNodes.currentNode);
    }

    const termMap = {};
    const regexTerms = Object.keys(analysis).map(term => {
        termMap[term.toLocaleLowerCase()] = analysis[term];
        return term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); 
    });
    const regex = new RegExp(`\\b(${regexTerms.join('|')})\\b`, 'gi');

    textNodesArray.forEach(node => {
        const parent = node.parentNode;
        if (!parent || parent.closest('script, style, noscript') || parent.classList?.contains ('highlighted-term')) return;

        const text = node.nodeValue;
        let matchObj; 
        const regexMatchesArray = [];

        while ((matchObj = regex.exec(text)) !== null) {
            matches.push({
                term: matchObj[0],
                start: matchObj.index,
                end: matchObj.index + match[0].length
            })
        }
    });

    // Using Range instead of innerHTML due to innerHTML breaking pubmed's JS 
    for (let i = matches.length -1; i >= 0; i--) {
        const { term, start, end } = matches[i];
        const range = document.createRange();
        range.setStart(node, start);
        range.setEnd(node, end);

        const span = document.createElement('span');
        span.className = 'highlighter-term';
        span.textContent = term;
        span.setAttribute('data-definition', termMap[term.toLocaleLowerCase()]);
        range.deleteContents();
        range.insertNode(span);
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
        console.log("sender;", sender);
        applyAnalysisAsHighlights(message.payload)
        sendResponse(true);
    }
}

// Listens for queue to send abstract text to popup.js via messaging
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    console.log("msg received");
    await handleMessage(message, sender, sendResponse);
    return true;
})


