console.log("elo, how are you!!!");

function getArticle() {
    const abstract = document.querySelector('div.abstract-content.selected')?.innerText.trim();

    return abstract;
}

// DOM Travesrsal 
function extractTextNodes() {
    const textNodes = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,

    );
    const textNodesArray = [];

    while (textNodes.nextNode()) {
        textNodesArray.push(textNodes.currentNode);
    }
    return textNodesArray;
}

// Building Regex
function buildRegexTerms(analysis) {
    const termMap = {};

    if (analysis.terms) {
        analysis.terms.forEach(({ term, definition }) => {
            if (term && definition) {
                termMap[term.toLowerCase()] = definition;
            }
        });
    }

    if (analysis.methodologies) {
        analysis.methodologies.forEach(({ term, definition }) => {
            if (term && definition) {
                termMap[term.toLowerCase()] = definition;
            }
        });
    }

    const regexTerms = Object.keys(termMap).map(term =>
    term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    );
    console.log("TERMS WTF:", regexTerms);

    return {
        regex: new RegExp(`\\b(${regexTerms.join('|')})\\b`, 'gi'),
        termMap: termMap
    }
}

// Text Matching
function findRegexMatches(node, regex) {
    const text = node.nodeValue;
    let matchObj; 
    const regexMatchesArray = [];
    regex.lastIndex = 0;

    while ((matchObj = regex.exec(text)) !== null) {
        regexMatchesArray.push({
            term: matchObj[0],
            start: matchObj.index,
            end: matchObj.index + matchObj[0].length,
            node
        });
        console.log("Regex used:", regex);
        console.log("Text node:", node.nodeValue);
        console.log("Match found:", matchObj);
    }

    return regexMatchesArray;
}

// DOM Manipulation !!! Using Range instead of innerHTML due to innerHTML breaking pubmed's JS !!!!!
function wrapMatchesInHighlights(regexMatchesArray, termMap) {
    for (let i = regexMatchesArray.length -1; i >= 0; i--) {
        const { term, start, end, node } = regexMatchesArray[i];
        const range = document.createRange();
        range.setStart(node, start);
        range.setEnd(node, end);

        const span = document.createElement('span');
        span.className = 'highlighted-term';
        span.textContent = term;
        span.setAttribute('data-definition', termMap[term.toLocaleLowerCase()]);
        range.deleteContents();
        range.insertNode(span);
        console.log("Inserting span for:", term);
        console.log("Start-End:", start, end);
    }
    // console.log("elo");
}

function applyAnalysisAsHighlights(analysis) {
    const textNodesArray = extractTextNodes();
    const { regex, termMap } = buildRegexTerms(analysis);
    let termMatches = [];

    textNodesArray.forEach(node => {
        const parent = node.parentNode;
        if (!parent || parent.closest('script, style, noscript') || parent.classList?.contains ('highlighted-term')) return;

        const regexMatchesArray = findRegexMatches(node, regex);
        termMatches = termMatches.concat(regexMatchesArray);

    });

    wrapMatchesInHighlights(termMatches, termMap);
    console.log("JSON OUTPUTE TO UNDDERSTAND:",analysis)
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


