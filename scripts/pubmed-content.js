// Querying the article by the standard html tags used in pubmed.
function getArticle() {
    const abstract = document.querySelector('div.abstract-content.selected')?.innerText.trim();

    return abstract;
}

// DOM Travesrsal to create an array of textnodes.
/* Text nodes are the safest way in this case to find words in a text and to wrap texts without breaking pubmeds js; innerhtml would break pubmeds js bc it re-parses, so it is not safe here.     
To understand answer the following:
1. What kind of nodes is it collecting?
2. Why *only* those nodes?
3. Is this traversal or mutation?
4. What would break if I used `innerHTML` instead?*/
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
    console.log("ANALYSIS:", analysis);
    const termMap = {};
    let fallbackDefinition = "The definition is having trouble loading.";
    let fallbackQuestion = "The question and/or answer is having trouble loading."

    if (analysis.terms?.[0]?.questions) {
        analysis.terms.forEach(({ term, definition, questions }) => {
            if (term && definition && questions) {
                termMap[term.toLocaleLowerCase()] = {term, 'definition': definition, 'questions': questions}
            } else if (term && definition) {
                termMap[term.toLocaleLowerCase()] = {term, 'definition': definition, 'questions': fallbackQuestion}
            } else if (term) {
                termMap[term.toLocaleLowerCase()] = {term, 'definition': fallbackDefinition, 'questions': fallbackQuestion}
            }
        });
    } else if (analysis.terms) {
        analysis.terms.forEach(({ term, definition }) => {
            if (term && definition) {
                termMap[term.toLowerCase()] = {'definition': definition};
            } else if (term) {
                termMap[term.toLowerCase()] = {'definition': fallbackDefinition};
            }
        });
    }

    if (analysis.methodologies?.[0]?.questions) {
        analysis.methodologies.forEach(({ methodology, definition, questions }) => {
            if (methodology && definition && questions) {
                termMap[methodology.toLocaleLowerCase()] = {'definition': definition, 'questions': questions}
            } else if (methodology && definition) {
                termMap[methodology.toLocaleLowerCase()] = {'definition': definition, 'questions': fallbackQuestion}
            } else if (methodology) {
                termMap[methodology.toLocaleLowerCase()] = {'definition': fallbackDefinition, 'questions': fallbackQuestion}
            }
        });
    } else if (analysis.methodologies) {
        analysis.methodologies.forEach(({ methodology, definition }) => {
            if (methodology && definition) {
                termMap[methodology.toLowerCase()] = {'definition': definition};
            } else if (methodology) {
                termMap[methodology.toLowerCase()] = {'definition': fallbackDefinition};
            }
        });
    }

    if (analysis.questions) {
        analysis.questions.forEach(({ placeholder, question, answer }) => {
            if (placeholder && question && answer) {
                termMap[placeholder] = {'questions': question, 'answer': answer};
            } else if (placeholder && question) {
                termMap[placeholder] = {'questions': question, 'answer': fallbackQuestion};
            } else if (placeholder) {
                console.log("Question and Answer are not valid for this placeholder:", placeholder)
            }
        })
    }

    const regexTerms = Object.keys(termMap).map(term =>
    term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    );

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
    }

    return regexMatchesArray;
}

/**
 * 
 * @param {*} regexMatchesArray 
 * @param {*} termMap 
 */
// DOM Manipulation 
// !!! Using Range instead of innerHTML due to innerHTML breaking pubmed's JS !!!!!
function wrapMatchesInHighlights(regexMatchesArray, termMap) {
    console.log("WRAPPING");
    for (let i = regexMatchesArray.length -1; i >= 0; i--) {
        const { term, start, end, node } = regexMatchesArray[i];
        const range = document.createRange();
        range.setStart(node, start);
        range.setEnd(node, end);

        const span = document.createElement('span');
        span.textContent = term;
        span.className = 'highlighted-term';
        span._analysis = {
            term,
            "definition": termMap[term.toLocaleLowerCase()]?.definition ?? null,
            "questions": termMap[term.toLocaleLowerCase()]?.questions ?? null,
            "answers": termMap[term.toLocaleLowerCase()]?.answers ?? null
        }

        range.deleteContents();
        range.insertNode(span);
    }
}

function buildTooltipContent(analysis) {
    let html = '';

    if (analysis.definition) {
        html += `<div class="tooltip-definition">${analysis.definition}</div>`
    }

    if (analysis.questions) {
        html += `<ul class="tooltip-questions"><li>${analysis.questions}</li></ul>`;
    }

    return html || '<div>No definition found</div>';
}

function setupTooltips() {
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip tooltip-visibility';
    document.body.appendChild(tooltip);

    const terms = document.querySelectorAll('.highlighted-term');
    terms.forEach(term => {
        term.addEventListener('mouseenter', (event => {
            const analysis = event.currentTarget._analysis;

            if (!analysis) {
                return;
            }

            tooltip.classList.remove('tooltip-visibility');
            tooltip.innerHTML = buildTooltipContent(analysis);

            const tooltipShape = event.target.getBoundingClientRect(); 
            tooltip.style.top = `${tooltipShape.bottom + window.scrollY + 8}px`;
            tooltip.style.left = `${tooltipShape.left + window.scrollX}px`;
        }) );

        term.addEventListener('mouseleave', () => {
            tooltip.classList.add('tooltip-visibility');
        });
    })


}

/**
 * 
 * @param {*} analysis 
 * termpMap shape 
 * {
  term: string,
  definition: string | null,
  questions: string[] | null,
  answers: string[] | null
}
 */
function applyAnalysisAsHighlights(analysis) {
    const textNodesArray = extractTextNodes();
    const { regex, termMap } = buildRegexTerms(analysis);
    let termMatches = [];

    textNodesArray.forEach(node => {
        const parent = node.parentNode;
        if (!parent || parent.closest('script, style, noscript') || parent.classList?.contains('highlighted-term')) return;

        const regexMatchesArray = findRegexMatches(node, regex);
        termMatches = termMatches.concat(regexMatchesArray);

    });

    wrapMatchesInHighlights(termMatches, termMap);
    setupTooltips();
}

/**
 * Replace each .highlighted-term element with a text node of its own text.
 */
function removeHighlights() {
    console.log("UNWRAPPING");
    const highlightedTerms = document.querySelectorAll('.highlighted-term');
    if (!highlightedTerms) return console.log('No highlighted terms exist');

    highlightedTerms.forEach(term => {
        const parent = term.parentElement;
        const text = term.textContent;
        const replacementNode = document.createTextNode(text);
        parent.replaceChild(replacementNode, term);
        parent.normalize();
    })
}

function handleMessage(message, sender, sendResponse) {
    if (message.action === "getAll") {
        const abstract = document.querySelector('div.abstract-content.selected')?.innerText.trim(); // only targets abstract for now
        sendResponse({ abstract });
    }

    if (message.action === "getSpecializedLanguage") {
        const abstract = document.querySelector('div.abstract-content.selected')?.innerText.trim();
        sendResponse({ abstract });
    }

    if (message.action === "applyHighlight") {
        removeHighlights();
        applyAnalysisAsHighlights(message.payload)
        sendResponse(true);
    }
}

// Listens for queue to send abstract text to popup.js via messaging
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    await handleMessage(message, sender, sendResponse);
    return true;
})


