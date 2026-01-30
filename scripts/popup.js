// Refactor to use classes?
// AnalyzeAll
document.getElementById('request-all').addEventListener('click', () => {

    chrome.tabs.query({ active: true, currentWindow: true}, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { action: "getAll" }, (response) => {
            if (!response || !response.abstract) {
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
                window.close()
            })
            .catch(err => {
                console.log("An error has occurred when fetching data in request-all popup.js:", err);
            })
        })
    })
})

// Specialized Language
document.getElementById('specialized-language').addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage( tabs[0].id, { action: "getSpecializedLanguage" }, (response) => {
            if (!response || !response.abstract) {
                console.log("No abstract retrieved in 'Specialized Language' call:", response);
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
                window.close();
            })
            .catch(err => {
                console.log("An error occured while fetching SpecializedLanguage data in popup.js: ", err);
            })
        } )
    })
})

// Analyze Methodology
document.getElementById('methodology').addEventListener('click', () => {

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
                window.close()
            })
            .catch(err => {
                console.log("An error has occurred when fetching data for methodology in popup.js:", err);
            })
        })
    })
})

// Analyze 
document.getElementById('active-reading').addEventListener('click', () => {

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
                window.close()
            })
            .catch(err => {
                console.log("An error has occurred when fetching data for active-reading in popup.js:", err);
            })
        })
    })
})


