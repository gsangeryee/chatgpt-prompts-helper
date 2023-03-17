/*
Author: Jason Zhang
Email: gsangeryeee@gmail.com
Date: March 17, 2023
Version: 1.0
Description: background.js
*/
chrome.browserAction.onClicked.addListener(() => {
    chrome.windows.create({
        url: 'sidebar.html',
        type: 'panel',
        width: 400,
        height: 600,
    });
});
