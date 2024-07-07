let userSelectorValue = '';

// Set new userSelectorValue
function setNewUserDefault(newUserId) {
    userSelectorValue = newUserId;
}

// Get users from DB by view get_users and populate userSelector
function populateChat(data) {
    const userSelector = document.getElementById('userSelector');
    userSelector.innerHTML = '';

    // Blank option to prompt user to select a user
    const blankOption = document.createElement('option');
    blankOption.value = '';
    blankOption.selected = true;
    userSelector.appendChild(blankOption);
    
    let canUseVariable = false;

    data.users.forEach(user => {
        const userOption = document.createElement('option');
        userOption.value = user.id;
        userOption.textContent = user.display_name;
        if (!data.blockList.includes(user.id)) {
            if (user.id === userSelectorValue) {
                canUseVariable = true;
            }
            userSelector.appendChild(userOption);
        }
    });
    if (canUseVariable) {
        userSelector.value = userSelectorValue;
    }
    userSelector.dispatchEvent(new Event('change'));
}

// Function to handle input change and enable/disable send button
function handleInputChange() {
    const messageText = document.getElementById('messageText');
    const sendButton = document.getElementById('messageSendButton');
    const userSelector = document.getElementById('userSelector');

    if (userSelector.value === '' || messageText.value.trim() === '') {
        sendButton.setAttribute('disabled', 'disabled');
    } else {
        sendButton.removeAttribute('disabled');
    }
}

// Get messages from DB by view get_messages and update chat-log div
async function loadMessages() {
    const userSelector = document.getElementById('userSelector');
    const chatLog = document.getElementById("chatLog");
    const messageReceiver = document.getElementById("messageReceiver")
    // Save selected user to userSelectorValue
    userSelectorValue = userSelector.value;
    messageReceiver.value = userSelectorValue;

    if (messageReceiver.value === '') {
        chatLog.innerHTML = '';
        return;
    }

    try {
        const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;
        const formData = new FormData();
        formData.append('friend', messageReceiver.value);
        const response = await fetch('/chat/get_messages/', {
            method: "POST",
            headers: {
                "X-CSRFToken": csrfToken
            },
            body: formData
        });

        if (!response.ok) {
            throw new Error('Failed to fetch messages');
        }

        const data = await response.json();
        chatLog.innerHTML = '';
        data.messages.forEach(message => {
            const messageDiv = document.createElement("div");
            messageDiv.classList.add("message");
            messageDiv.innerHTML = `
                <p><strong>${message.sender}</strong>: ${message.content}</p>
                <p class="timestamp">${new Date(message.timestamp).toLocaleString()}</p>
            `;
            chatLog.appendChild(messageDiv);
        });
        chatLog.scrollTop = chatLog.scrollHeight;
    } catch (error) {
        console.error('Error fetching messages:', error.message);
    }
}

// Send message to DB by view send_message
async function sendMessage(event) {
    event.preventDefault();
    event.stopPropagation();
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;
    const messageReceiver = document.getElementById("messageReceiver");
    const messageInput = document.getElementById("messageText");
    const messageContent = messageInput.value;
    const formData = new FormData();
    
    if (messageReceiver.value === "") {
        return;
    }

    formData.append('messageReceiver', messageReceiver.value);
    formData.append('messageText', messageContent);

    try {
        const response = await fetch('/chat/send_message/', {
            method: 'POST',
            headers: {
                'X-CSRFToken': csrfToken
            },
            body: formData
        });

        if (!response.ok) {
            throw new Error('Failed to send message');
        }

        console.log("Message sent successfully");
        messageInput.value = '';
        document.getElementById('messageSendButton').setAttribute('disabled', 'disabled');
        loadMessages();
    } catch (error) {
        console.error('Error sending message:', error.message);
    }
}

// Event listeners
document.getElementById('messageText').addEventListener('input', handleInputChange);
document.getElementById('messageInput').addEventListener('submit', sendMessage);
document.getElementById('userSelector').addEventListener('change', loadMessages);

// Initial load and 5 second interval to update chat log
loadMessages();
setInterval(loadMessages, 5000); // Adjust interval as needed