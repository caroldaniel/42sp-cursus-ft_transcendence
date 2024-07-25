async function redistributeSessionStorageItems() {
    sessionStorage.clear();
    const currentUser = document.getElementById('displayNameSpan').textContent;


    try {
        // Retrieve the combined item from the server
        const response = await fetch('/session/get/');
        // Check if the response status is 400
        if (response.status === 204) {
            return;
        }
        
        const combinedItemsJSON = await response.json();
        // Check if the combined item exists
        if (combinedItemsJSON) {

            // Store each item from the object back into sessionStorage individually
            for (let key in combinedItemsJSON) {
                if (combinedItemsJSON.hasOwnProperty(key)) {
                    sessionStorage.setItem(key, combinedItemsJSON[key]);
                }
            }
            sessionStorage.setItem('redistributed', 'true');
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
