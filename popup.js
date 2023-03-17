/*
Author: Jason Zhang
Email: gsangeryeee@gmail.com
Date: March 17, 2023
Version: 1.0
Description: popup.js is the script that runs in the popup.html file.
*/

const itemsPerPage = 10;
let currentPage = 1;

async function loadPrompts() {
    try {
        const prompts = await fetchPrompts();
        displayPrompts(prompts, currentPage);
        createPagination(prompts.length);
    } catch (error) {
        console.error("Error loading prompts:", error);
    }
}

function getPromptsFromStorage() {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get('prompts', (data) => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            } else {
                resolve(data.prompts || []);
            }
        });
    });
}


function savePromptsToStorage(prompts) {
    return new Promise((resolve, reject) => {
        chrome.storage.local.set({ prompts }, () => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            } else {
                resolve();
            }
        });
    });
}


// Fetch prompts from the local CSV file
async function fetchPrompts() {
    try {
        const prompts = await getPromptsFromStorage();
        if (prompts && prompts.length > 0) {
            return prompts;
        }
    } catch (error) {
        console.error("Failed to get Prompts data from storage:", error);
    }

    const response = await fetch(chrome.runtime.getURL("prompts.csv"));

    if (response.ok) {
        const csvData = await response.text();
        const prompts = parseCsv(csvData);
        try {
            await savePromptsToStorage(prompts);
        } catch (error) {
            console.error("Failed to save Prompts data to storage:", error);
        }
        return prompts;
    } else {
        throw new Error("Failed to fetch Prompts data");
    }
}


/*
* from github
async function fetchPrompts() {
    try {
        const prompts = await getPromptsFromStorage();
        if (prompts) {
            return prompts;
        }
    } catch (error) {
        console.error("Failed to get Prompts data from storage:", error);
    }

    const response = await fetch(
        "https://raw.githubusercontent.com/f/awesome-chatgpt-prompts/main/prompts.csv"
    );

    if (response.ok) {
        const csvData = await response.text();
        const prompts = parseCsv(csvData);
        try {
            await savePromptsToStorage(prompts);
        } catch (error) {
            console.error("Failed to save Prompts data to storage:", error);
        }
        return prompts;
    } else {
        throw new Error("Failed to fetch Prompts data");
    }
}*/

/*
// Parse the CSV file
function parseCsv(csv) {
    const rows = csv.split('\n');
    const prompts = rows.slice(1).map((row) => { // skip the first row, which contains the headers
        const [act, prompt] = row.split(',');
        return { act, prompt: prompt.substring(1) }; // delete the leading quote
    });
    return prompts;
}*/

// using PapaParse
// skip the first row, which contains the headers
// delete the leading quote
function parseCsv(csv) {
    const parsedData = Papa.parse(csv, {
        header: true,
        skipEmptyLines: true,
    });

    const prompts = parsedData.data.map((row) => ({
        act: row.act,
        prompt: row.prompt,
    }));

    return prompts;
}


// Display prompts in the popup
function displayPrompts(prompts, page) {
    const container = document.getElementById('prompts-container');
    const tbody = container.querySelector('tbody');
    tbody.innerHTML = '';

    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const promptsToDisplay = prompts.slice(start, end);

    promptsToDisplay.forEach((prompt) => {
        const row = document.createElement('tr');
        row.addEventListener('click', () => {
            copyToClipboard(prompt.prompt);
        });

        const actCell = document.createElement('td');
        actCell.textContent = prompt.act;
        row.appendChild(actCell);

        const promptCell = document.createElement('td');
        promptCell.textContent = prompt.prompt;
        row.appendChild(promptCell);

        tbody.appendChild(row);
    });
}

// Copy prompt content to clipboard
function copyToClipboard(promptContent, event) {
    navigator.clipboard.writeText(promptContent).then(
        () => {
            console.log('Prompt copied to clipboard');
            showCopiedMessage(event.clientX, event.clientY); // display a message to the user
        },
        (err) => {
            console.error('Error copying prompt to clipboard', err);
        }
    );
}



// Add a new prompt
function addPrompt() {
    const act = prompt('Enter the act for the new Prompt:');
    const promptContent = prompt('Enter the content for the new Prompt:');
    if (act && promptContent) {
        const newPrompt = { act, prompt: promptContent };
        chrome.storage.local.get(['prompts'], (result) => {
            const prompts = result.prompts || [];
            prompts.push(newPrompt);
            chrome.storage.local.set({ prompts }, () => {
                displayPrompts(prompts);
            });
        });
    }
}

//document.getElementById('add-prompt').addEventListener('click', addPrompt);

function displayPrompts(prompts, page) {
    const container = document.getElementById('prompts-container');
    container.innerHTML = '';

    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const promptsToDisplay = prompts.slice(start, end);

    promptsToDisplay.forEach((prompt) => {
        const row = document.createElement('tr');

        row.addEventListener('click', (event) => {
            copyToClipboard(prompt.prompt, event);
        });

        const actCell = document.createElement('td');
        actCell.textContent = prompt.act;
        row.appendChild(actCell);

        const promptCell = document.createElement('td');
        promptCell.textContent = prompt.prompt;
        row.appendChild(promptCell);

        container.appendChild(row);
    });
}


function createPagination(totalItems) {
    const paginationContainer = document.getElementById('pagination-container');
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    paginationContainer.innerHTML = '';

    for (let i = 1; i <= totalPages; i++) {
        const pageNumber = document.createElement('span');
        pageNumber.classList.add('page-number');
        pageNumber.textContent = i;

        if (i === currentPage) {
            pageNumber.classList.add('active');
        }

        pageNumber.addEventListener('click', () => {
            currentPage = i;
            loadPrompts();
        });

        paginationContainer.appendChild(pageNumber);
    }
}

function showCopiedMessage(x, y) {
    const copiedElement = document.createElement('div');
    copiedElement.textContent = 'Copied!';
    copiedElement.style.position = 'fixed';
    copiedElement.style.left = x + 'px';
    copiedElement.style.top = y + 'px';
    copiedElement.style.background = '#ffffff';
    copiedElement.style.padding = '5px';
    copiedElement.style.border = '1px solid #000000';
    copiedElement.style.borderRadius = '3px';
    copiedElement.style.zIndex = 1000;

    document.body.appendChild(copiedElement);

    setTimeout(() => {
        copiedElement.remove();
    }, 3000);
}

loadPrompts();
