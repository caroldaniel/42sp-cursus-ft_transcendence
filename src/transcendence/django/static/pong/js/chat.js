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

// Function to update the unread messages badge
async function updateUnreadMessages() {
    // Get csrf token
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;

    // Iterate through all rows in user table bodies and get each user id in the tr id (formated as 'user_{id}')
    const userTableBody = document.querySelector('#userTable tbody');
    const formData = new FormData();

    // Get API response for unread messages
    try {
        const response = await fetch('/chat/get_unread/', {
            method: 'POST',
            headers: {
                'X-CSRFToken': csrfToken
            },
            body: formData
        });
        
        if (!response.ok) {
            throw new Error('Failed to get unread messages');
        }

        const data = await response.json();

        const unreadMessagesBadge = document.getElementById('unreadMessagesBadge');
        unreadMessagesBadge.textContent = data.unread_messages;
        if (data.unread_messages === 0) {
            unreadMessagesBadge.setAttribute('hidden', '');
        } else {
            unreadMessagesBadge.removeAttribute('hidden');
        }


        const unreadChatsBadge = document.getElementById('unreadChatsBadge');
        unreadChatsBadge.textContent = data.unread_counts.length;
        if (data.unread_counts.length === 0) {
            unreadChatsBadge.setAttribute('hidden', '');
        } else {
            unreadChatsBadge.removeAttribute('hidden');
        }

        data.unread_counts.forEach(unread_chat => {
            const senderId = unread_chat.sender_id;
            const unreadCount = unread_chat.unread_count;
            const userListBadge = document.getElementById(`unreadMessagesBadge_${senderId}`);
            if (!userListBadge)
                return;
            userListBadge.textContent = unread_chat.unread_count;
            if (unreadCount === 0) {
                userListBadge.setAttribute('hidden', '');
            } else {
                userListBadge.removeAttribute('hidden');
            }
        });

    } catch (error) {
        console.error('Error loading unread messages:', error.message);
    }
}


// Function to populate the chat log with messages
function populateChatLog(messages) {
    const chatLog = document.getElementById('chatLog');
    chatLog.innerHTML = '';

    // If no messages, display no messages div
    if (messages.length === 0) {
        const noMessagesDiv = document.createElement('div');
        noMessagesDiv.classList.add('no-messages');
        noMessagesDiv.textContent = 'No messages yet';
        chatLog.appendChild(noMessagesDiv);
        return;
    }

    let lastSender = null;
    let lastMessageDiv = null;
    messages.forEach(message => {
        if (lastSender !== message.sender) {
            const messageDiv = document.createElement('div');
            messageDiv.classList.add('message');
            messageDiv.classList.add(message.sender_id == userSelectorValue ? 'received' : 'sent');
            
            // Add display name to messageDiv
            const displayNameDiv = document.createElement('div');
            displayNameDiv.classList.add('sender');
            displayNameDiv.textContent = message.sender;
            messageDiv.appendChild(displayNameDiv);

            // Add timestamp to messageDiv
            const timestampDiv = document.createElement('div');
            timestampDiv.classList.add('timestamp');
            timestampDiv.textContent = new Date(message.timestamp).toLocaleString('en-US', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric', 
                hour: 'numeric', 
                minute: 'numeric', 
                hour12: true 
            });
            messageDiv.appendChild(timestampDiv);

            lastMessageDiv = messageDiv;
            chatLog.appendChild(messageDiv);
        }

        const messageContentDiv = document.createElement('div');
        messageContentDiv.classList.add('message-content');
        messageContentDiv.textContent = message.content;
        lastMessageDiv.appendChild(messageContentDiv);

        lastSender = message.sender;
    });
}


// Get messages from DB by view get_messages and update chat-log div
async function loadMessages() {

    const userSelector = document.getElementById('userSelector');
    const messageReceiver = document.getElementById("messageReceiver");
    
    userSelectorValue = userSelector.value;
    messageReceiver.value = userSelectorValue;
    
    // Get chat log div
    const chatLog = document.getElementById("chatLog");
    // Get csrf token
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;

    // Update unread messages and chats badges
    //updateUnreadMessages();
    
    // check if socialOffCanvas is being shown and if the chat-tab is the one active
    const socialOffCanvas = document.getElementById('socialOffCanvas');
    const chatTab = document.getElementById('chat-tab');
    
    if (socialOffCanvas.classList.contains('show') && chatTab.classList.contains('active')) {
        if (messageReceiver.value === '') {
            chatLog.innerHTML = '';
            return;
        }

        const formData = new FormData();
        formData.append('friend', messageReceiver.value);

        try {
            const response = await fetch('/chat/get_messages/', {
                method: 'POST',
                headers: {
                    'X-CSRFToken': csrfToken
                },
                body: formData
            });
            
            if (!response.ok) {
                throw new Error('Failed to load message');
            }

            const data = await response.json();

            populateChatLog(data.messages);
        } catch (error) {
            console.error('Error loading messages:', error.message);
        }
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
setInterval(loadMessages, 1000); // Adjust interval as needed