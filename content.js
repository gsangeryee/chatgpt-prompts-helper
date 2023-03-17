/*
Author: Jason Zhang
Email: gsangeryeee@gmail.com
Date: March 17, 2023
Version: 1.0
Description: content.js is the script that runs in the content.html file.
*/
function createSidebar() {
    const sidebar = document.createElement('div');
    sidebar.style.cssText =
        'position: fixed; top: 0; right: -300px; height: 100%; width: 300px; z-index: 1000; background-color: #ffffff; border-left: 1px solid #cccccc; padding: 16px; box-sizing: border-box; transition: right 0.3s;';
    sidebar.id = 'mySidebar';
    return sidebar;
}

function openPopup() {
    const sidebar = document.getElementById('mySidebar');
    const isVisible = sidebar.style.right === '0px';

    if (isVisible) {
        sidebar.style.right = '-300px';
    } else {
        sidebar.style.right = '0px';
    }
}

function addButtonToPage() {
    const chatInputContainer = document.querySelector('.chatInputContainer');
    if (chatInputContainer) {
        const button = createButton();
        const sidebar = createSidebar();
        chatInputContainer.style.position = 'relative';
        chatInputContainer.appendChild(button);
        document.body.appendChild(sidebar);
    } else {
        setTimeout(addButtonToPage, 1000); // Retry after 1 second
    }
}

addButtonToPage();
