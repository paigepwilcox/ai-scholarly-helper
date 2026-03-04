const FEATURE_FLAGS = {
    REQUEST_ALL: false,
    SPECIALIZED_LANGUAGE: true,
    METHODOLOGY: true,
    ACTIVE_READING: true
};

function startLoading() {
    //toggle spinner
    const spinner_overlay = document.querySelector('.overlay');
    spinner_overlay.classList.remove('overlay-visibility');
}

function stopLoading() {
    const spinner_overlay = document.querySelector('.overlay');
    spinner_overlay.classList.add('overlay-visibility');
}

// Refactor to use classes?
// AnalyzeAll
if (FEATURE_FLAGS.REQUEST_ALL) {
    document.getElementById('request-all').addEventListener('click', () => {

        //toggle spinner
        startLoading();

        chrome.tabs.query({ active: true, currentWindow: true}, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, { action: "getAbstract" }, (response) => {
                if (!response || !response.abstract) {
                    stopLoading();
                    console.log("No abstract retrieved in 'getAbstract' call popup.js:", response);
                    return
                }

                fetch("http://localhost:8000/aish/analyze/questions/", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        section: response.abstract
                    })
                })
                .then(response => response.json())
                .then(data => {
                    // send message to content script to highlight data 
                    chrome.tabs.sendMessage(tabs[0].id, {
                        action: "applyHighlight",
                        payload: data
                    });
                    stopLoading();
                    window.close()
                })
                .catch(err => {
                    stopLoading();
                    console.log("An error has occurred when fetching data in getAbstract, request-all call popup.js:", err);
                })
            })
        })
    })
} else {
    document.getElementById('request-all').style.display = 'none';
}

// Specialized Language
if (FEATURE_FLAGS.SPECIALIZED_LANGUAGE) {
    document.getElementById('specialized-language').addEventListener('click', () => {
        startLoading();
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.sendMessage( tabs[0].id, { action: "getAbstract" }, (response) => {
                if (!response || !response.abstract) {
                    console.log("No abstract retrieved in 'getAbstract' specialized-language call:", response);
                    stopLoading();
                    return;
                }

                fetch("http://localhost:8000/aish/language/", {
                    method: 'POST',
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        section: response.abstract
                    })
                })
                .then(response => response.json())
                .then(data => {
                    chrome.tabs.sendMessage(tabs[0].id, {
                        action: "applyHighlight",
                        payload: data
                    })
                    stopLoading();
                    window.close();
                })
                .catch(err => {
                    stopLoading();
                    console.log("An error occured while fetching SpecializedLanguage data in popup.js: ", err);
                })
            } )
        })
    })
} else {
    document.getElementById('specialized-language').style.display('none');
}

// Analyze Methodology
if (FEATURE_FLAGS.METHODOLOGY) {
    document.getElementById('methodology').addEventListener('click', () => {
        startLoading();
        chrome.tabs.query({ active: true, currentWindow: true}, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, { action: "getAbstract" }, (response) => {
                if (!response || !response.abstract) {
                    console.log("No abstract retrieved in 'getAbstract' methodology call:", response);
                    return
                }

                fetch("http://localhost:8000/aish/methodology/", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        section: response.abstract
                    })
                })
                .then(response => response.json())
                .then(data => {
                    // send message to content script to highlight data 
                    chrome.tabs.sendMessage(tabs[0].id, {
                        action: "applyHighlight",
                        payload: data
                    });
                    stopLoading();
                    window.close()
                })
                .catch(err => {
                    stopLoading();
                    console.log("An error has occurred when fetching data for methodology in popup.js:", err);
                })
            })
        })
    })
} else {
    document.getElementById('methodology').style.display('none');
}

// Analyze 
if (FEATURE_FLAGS.ACTIVE_READING) {
    document.getElementById('active-reading').addEventListener('click', () => {
        startLoading();
        chrome.tabs.query({ active: true, currentWindow: true}, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, { action: "getAbstract" }, (response) => {
                if (!response || !response.abstract) {
                    console.log("No abstract retrieved in 'getAbstract' call:", response);
                    return
                }

                fetch("http://localhost:8000/aish/questions/", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        section: response.abstract
                    })
                })
                .then(response => response.json())
                .then(data => {
                    // send message to content script to highlight data 
                    chrome.tabs.sendMessage(tabs[0].id, {
                        action: "applyHighlight",
                        payload: data
                    });
                    stopLoading();
                    window.close()
                })
                .catch(err => {
                    stopLoading();
                    console.log("An error has occurred when fetching data for active-reading in popup.js:", err);
                })
            })
        })
    })
} else {
    document.getElementById('active-reading').display.style('none');
}



