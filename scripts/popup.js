// Refactor to use classes?

// AnalyzeAll
document.getElementById('request-all').addEventListener('click', () => {

    chrome.tabs.query({ active: true, currentWindow: true}, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { action: "getAll" }, (response) => {
            if (!response || !response.abstract) {
                console.error("No abstract available:", response);
                return
            }

            fetch("http://localhost:8000/aish/analyze/", {
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
                console.log("did it!", data);
                
                chrome.tabs.sendMessage(tabs[0].id, {
                    action: "applyHighlight",
                    payload: data
                });
                console.log("hit on popupjs");
            })
            .catch(err => {
                console.log("An error has occurred when fetching data:", err);
            })
        })
    })
})

// Specialized Language
document.getElementById('specialized-language').addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage( tabs[0].id, { action: "getSpecializedLanguage" }, (response) => {
            if (!response || !response.abstract) {
                console.error("No Abstract Available", response);
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
            })
            .catch(err => {
                console.log("An error occured while fetching getSpecializedLanguage data: ", err);
            })
        } )
    })
})
