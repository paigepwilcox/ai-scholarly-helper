

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
                console.log("did it!", data);
            })
            .catch(err => {
                console.log("An error has occurred when fetching data:", err);
            })
        })
    })
})