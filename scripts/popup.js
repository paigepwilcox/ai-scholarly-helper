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
document.getElementById('request-all').addEventListener('click', () => {

    //toggle spinner
    startLoading();

    chrome.tabs.query({ active: true, currentWindow: true}, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { action: "getAll" }, (response) => {
            if (!response || !response.abstract) {
                stopLoading();
                console.log("No abstract retrieved in 'Request All' call popup.js:", response);
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
                console.log("An error has occurred when fetching data in request-all popup.js:", err);
            })
        })
    })
})

// Specialized Language
document.getElementById('specialized-language').addEventListener('click', () => {
    startLoading();
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage( tabs[0].id, { action: "getSpecializedLanguage" }, (response) => {
            if (!response || !response.abstract) {
                console.log("No abstract retrieved in 'Specialized Language' call:", response);
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

// Analyze Methodology
document.getElementById('methodology').addEventListener('click', () => {
    startLoading();
    chrome.tabs.query({ active: true, currentWindow: true}, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { action: "getAll" }, (response) => {
            if (!response || !response.abstract) {
                console.log("No abstract retrieved in 'Request All' call:", response);
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

// Analyze 
document.getElementById('active-reading').addEventListener('click', () => {
    startLoading();
    chrome.tabs.query({ active: true, currentWindow: true}, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { action: "getAll" }, (response) => {
            if (!response || !response.abstract) {
                console.log("No abstract retrieved in 'Request All' call:", response);
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


