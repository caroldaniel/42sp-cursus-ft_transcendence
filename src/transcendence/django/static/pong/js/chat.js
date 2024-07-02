console.log("sanity test script chat!!");

// Load messages when select user
document.getElementById('userSelector').addEventListener('change', function() {
    const receiverInput = document.getElementById('receiver');
    receiverInput.value = this.value;
    loadMessages();
});


// Get messages from DB by view get_messages and update chat-log div
async function loadMessages() {
    const userSelector = document.getElementById('userSelector');
    const receiverInput = document.getElementById('receiver');
    const chatLog = document.getElementById("chatLog");

    if (userSelector.value === "Users") {
        chatLog.innerHTML = '';
        return;
    }

    try {
        const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;
        const formData = new FormData();
        formData.append('friend', receiverInput.value);
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
    } catch (error) {
        console.error('Error fetching messages:', error.message);
    }
}

// Load messages every second
setInterval(loadMessages, 1000);

// Send message to DB by view send_message
function sendMessage() {
    console.log("sendMessage function");
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;
    const messageInput = document.getElementById("message");
    const receiverInput = document.getElementById("receiver");
    const messageContent = messageInput.value;
    const formData = new FormData();
    const receiverId = receiverInput.value;

    formData.append('receiver', receiverId);
    formData.append('message', messageContent);
    const response = fetch('/chat/send_message/', {
        method: 'POST',
        headers: {
            'X-CSRFToken': csrfToken
        },
        body: formData
    });
    console.log("message sent, response: ", response);
    messageInput.value = '';
}