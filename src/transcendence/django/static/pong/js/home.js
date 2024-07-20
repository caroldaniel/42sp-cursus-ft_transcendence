async function redistributeSessionStorageItems() {
    // Check if the data has already been redistributed
    //if (sessionStorage.getItem('redistributed')) {
    //    console.log('Items from sessionStorage already redistributed.');
    //    return;
    //}

    sessionStorage.clear();
    const currentUser = document.getElementById('displayNameSpan').textContent;

    console.log(`Redistributing sessionStorage items for ${currentUser}.`);

    try {
        // Retrieve the combined item from the server
        const response = await fetch('/session/get/');
        // Check if the response status is 400
        if (response.status === 404) {
            console.log('No item found on the server.');
            return;
        }
        
        const combinedItemsJSON = await response.json();
        // Check if the combined item exists
        console.log('Combined items found:', combinedItemsJSON);
        if (combinedItemsJSON) {

            // Store each item from the object back into sessionStorage individually
            for (let key in combinedItemsJSON) {
                if (combinedItemsJSON.hasOwnProperty(key)) {
                    sessionStorage.setItem(key, combinedItemsJSON[key]);
                }
            }
            sessionStorage.setItem('redistributed', 'true');
            console.log('Combined items successfully stored in sessionStorage.');
        } else {
            console.log('No combined item found in sessionStorage.');
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

async function logout() {
    sessionStorage.clear();
    window.location.href = '/logout';
}

function setupHome() {
    console.log('Setting up the home page...');
    // Retrieve all items only once per session
    if (document.getElementById('displayNameSpan')) {
        redistributeSessionStorageItems();
    }
    return;
}
