
// Querying the article by the standard html tags used in pubmed.
function getArticle() {
    console.log('GETTING ABSTRACT');
    console.log(document.querySelector('div.abstract-content.selected')?.innerText.trim());
    const abstract = document.querySelector('div.abstract-content.selected')?.innerText.trim();
    console.log("abstract in rretrieve:", abstract);
    return abstract;
}

function getAbstractRoot() {
    return document.querySelector('div.abstract-content.selected p');
}

function isNodeInsideAbstract(node, abstractRoot) {
    return abstractRoot && abstractRoot.contains(node);
}

// DOM Travesrsal to create an array of textnodes.
/* Text nodes are the safest way in this case to find words in a text and to wrap texts without breaking pubmeds js; innerhtml would break pubmeds js bc it re-parses, so it is not safe here.     
To understand answer the following:
1. What kind of nodes is it collecting?
2. Why only those nodes?
3. Is this traversal or mutation?
4. What would break if I used `innerHTML` instead?*/
function extractTextNodes(rootNode = document.body) {
    console.log("extracting");
    const abstractRoot = getAbstractRoot();

    if (!abstractRoot) console.log("abstractRoot is flasey in extractTextNodes: ", abstractRoot);
    const abstractRootNode = document.querySelector('div.abstract');

    const textNodes = document.createTreeWalker(
        abstractRoot,
        NodeFilter.SHOW_TEXT,

    );

    const textNodesArray = [];

    while (textNodes.nextNode()) {
        textNodesArray.push(textNodes.currentNode);
    }

    return textNodesArray;
}

function getAbstractTextNodes() {
    const abstractRoot = getAbstractRoot();

    if (!abstractRoot) {
        console.log('Abstract Not Found -- getAbstractTextNodes');
        return [];
    }

    const allTextNodes = extractTextNodes(document.body);
    return allTextNodes.filter(node => {
        let result = isNodeInsideAbstract(node, abstractRoot);
        return result;
   } );
}

/**
 * 
 * @param {object} analysis 
 * @returns 
 */
// Building Regex
function buildRegexTerms(analysis) {
    // console.log("ANALYSIS:", analysis);
    const termMap = {};
    let fallbackDefinition = "The definition is having trouble loading.";
    let fallbackQuestion = "The question and/or answer is having trouble loading."

    if (analysis.terms?.[0]?.questions) {
        analysis.terms.forEach(({ term, definition, questions, answers }) => {
            const lowerCasedTerm = term.toLocaleLowerCase();
            if (term && definition && questions) {
                termMap[lowerCasedTerm] = {lowerCasedTerm, 'definition': definition, 'questions': questions, 'answers': answers}
            } else if (term && definition) {
                termMap[lowerCasedTerm] = {lowerCasedTerm, 'definition': definition, 'questions': fallbackQuestion, 'answers': fallbackDefinition}
            } else if (term) {
                termMap[lowerCasedTerm] = {lowerCasedTerm, 'definition': fallbackDefinition, 'questions': fallbackQuestion, 'answers': fallbackDefinition}
            }
        });
    } else if (analysis.terms) {
        analysis.terms.forEach(({ term, definition }) => {
            const lowerCasedTerm = term.toLocaleLowerCase();
            if (term && definition) {
                termMap[lowerCasedTerm] = {lowerCasedTerm, 'definition': definition};
            } else if (term) {
                termMap[lowerCasedTerm] = {lowerCasedTerm, 'definition': fallbackDefinition};
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
        analysis.questions.forEach(({ placeholder, question, answers }) => {
            const lowerCasedPlaceholdeer = placeholder.toLocaleLowerCase();
            if (placeholder && question && answers) {
                termMap[lowerCasedPlaceholdeer] = {'questions': question, 'answers': answers};
            } else if (placeholder && question) {
                termMap[lowerCasedPlaceholdeer] = {'questions': question, 'answers': fallbackQuestion};
            } else if (lowerCasedPlaceholdeer) {
                console.log("Question and Answer are not valid for this placeholder:", placeholder)
            }
        })
    }

    const regexTerms = Object.keys(termMap).map(term =>
        term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    );

    return {
        regex: new RegExp(`(${regexTerms.join('|')})`, 'gi'),
        // regex: new RegExp(`\\b(${regexTerms.join('|')})\\b`, 'gi'),
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
 * @param {[]} regexMatchesArray 
 * @param { {term, definition: string} } termMap 
 */
// DOM Manipulation 
// Using Range instead of innerHTML due to innerHTML breaking pubmed's JS 
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

function addEventListenerForShowAnswer(button) {
    console.log("DEBUGGING, button: ", button);
    button.addEventListener('click', (event) => {
        console.log("DEBUGGING, button.nextElementSibling:", button.nextElementSibling);
        button.nextElementSibling.classList.toggle('hide-answer');
    });

}

/**
 * questions = {
 *              placeholder: term, 
 *              question: ["", ""], 
 *              answer: ["", ""]
 *             }
 * @param {json object} analysis 
 * @returns 
 */
function buildTooltipContent(analysis) {
    console.log("analysis in buildtooltip content: ", analysis);
    let html = '';
    let fallbackELement = document.createElement('div');
    fallbackELement.textContent = 'No definition found';
    let htmlElement = document.createElement('div');
    let questionList = document.createElement('ul');

    htmlElement.appendChild(questionList);

    if (analysis.definition) {
        const definition = document.createElement('div');
        definition.className = 'tooltip-definition';
        definition.textContent = analysis.definition;
        htmlElement.appendChild(definition);
    }
    console.log("HERE")
    if (analysis.questions === null || analysis.questions == []) {
        return htmlElement;
    }
    console.log("here?")
    if (analysis.questions?.length > 1 && analysis.answers?.length > 1) {
        console.log("why is it not here?");
        questionList.className = 'tooltip-questions';
        htmlElement.appendChild(questionList);
        for (let index = 0; index < analysis.questions.length; index ++) {
            const questionElement = document.createElement('li');
            const toggleElement = document.createElement('li');
            const toggleButton = document.createElement('button');
            const answerElement = document.createElement('li');
            questionElement.textContent = analysis.questions[index];
            toggleButton.textContent = 'Show Answer';
            answerElement.textContent = analysis.answers[index];
            answerElement.className = 'hide-answer answer';
            toggleElement.className = 'answer-btn-li';
            toggleButton.className = 'tooltip-show-answer-btn';
            toggleElement.appendChild(toggleButton);
            questionList.appendChild(questionElement);
            questionList.appendChild(toggleElement);
            questionList.appendChild(answerElement);
            addEventListenerForShowAnswer(toggleElement);
        }
    } else if (analysis.answers?.length > 0) {
        const questionElement = document.createElement('li');
        const answerElement = document.createElement('li');
        const toggleElement = document.createElement('li');
        const toggleButton = document.createElement('button');

        questionList.className = 'tooltip-questions';
        answerElement.className = 'hide-answer';
        toggleElement.className = 'answer-btn-li';
        questionElement.textContent = analysis.questions[0];
        toggleButton.textContent = 'Show Answer';
        answerElement.textContent = analysis.answers[0];
        
        htmlElement.appendChild(questionList);
        questionList.appendChild(questionElement);
        toggleElement.appendChild(toggleButton);
    } else {
        console.log("IS IT HERE???");
        const questionElement = document.createElement('li');
        questionList.className = 'tooltip-questions';
        questionElement.textContent = analysis.questions[0];
        questionList.appendChild(questionElement);
        htmlElement.appendChild(questionList);
    }

    return htmlElement || fallbackELement;
}

/**
 * 
 */
function setupTooltips() {
    // if (document.querySelector('.tooltip')) return; 
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
            tooltip.replaceChildren(buildTooltipContent(analysis));

            const tooltipShape = event.target.getBoundingClientRect(); 
            tooltip.style.top = `${tooltipShape.bottom + window.scrollY}px`;
            tooltip.style.left = `${tooltipShape.left + window.scrollX}px`;
        }) );

        tooltip.addEventListener('mouseenter', () => {
            tooltip.classList.remove('tooltip-visibility')
        });
        tooltip.addEventListener('mouseleave', () => {
            tooltip.classList.add('tooltip-visibility');
        });

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
    const abstractNodesArray = getAbstractTextNodes();
    // const textNodesArray = extractTextNodes();
    const { regex, termMap } = buildRegexTerms(analysis);
    let termMatchesArray = [];

    abstractNodesArray.forEach(node => {
        const parent = node.parentNode;
        if (!parent || parent.closest('script, style, noscript') || parent.classList?.contains('highlighted-term')) return;

        const regexMatchesArray = findRegexMatches(node, regex);
        termMatchesArray = termMatchesArray.concat(regexMatchesArray);

    });

    console.log("analysis: ", analysis, "regex: ", regex, "termMap: ", termMap, "termMatchesArray: ", termMatchesArray);
    wrapMatchesInHighlights(termMatchesArray, termMap);
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


