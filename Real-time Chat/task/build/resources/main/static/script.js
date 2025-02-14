const stompClient = new StompJs.Client({
    brokerURL: 'ws://localhost:28852/ws'
});

let local_user_nickname = "";

const sendMsgBtn = document.getElementById("send-msg-btn");
const inputMsg = document.getElementById("input-msg");

let users_list = [];

function handleIncomingMessage(message) {
    const msgElement = createMessageElement(message.sender, message.content, message.timestamp);
    appendMessageToDOM(msgElement);
}


stompClient.onWebSocketError = (error) => {
    alert("An error occurred while connecting to the WebSocket server. Please refresh the page.");
};

stompClient.onStompError = (frame) => {
    alert(NICKNAME_TAKEN_ALERT);
};

function connect() {
    stompClient.activate();
    stompClient.onConnect = (frame) => {
        stompClient.subscribe('/topic/public-chat', (ChatMessage) => {
            const message = JSON.parse(ChatMessage.body);
            handleIncomingMessage(message);
        });
    };
}

function sendMessageToServer(message, timestamp) {

    if (document.getElementById("chat-with").textContent === "Public chat") {
        console.log("Sending message to: Public chat");
        stompClient.publish({
            destination: "/app/public-chat",
            body: JSON.stringify({
                'content': inputMsg.value,
                'timestamp': new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString()
            })
        });
    }else{
        const containers =document.querySelectorAll(".user-container");
        containers.forEach(container => {
            if(container.querySelector(".user").textContent === document.getElementById("chat-with").textContent){
                container.parentNode.prepend(container);
            }
        });
        const topic = [local_user_nickname, document.getElementById("chat-with").textContent].sort().join("-");
        console.log("Sending message to: " + topic);
        stompClient.publish({
            destination: `/app/private-chat/${topic}`,
            body: JSON.stringify({
                'content': inputMsg.value,
                'timestamp': new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString()
            })
        });
    }
}


function handleSendMessage() {
    const message = inputMsg.value;
    const timestamp = new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString();
    if (message.length > 0) {
        sendMessageToServer(message, timestamp);
        inputMsg.value = "";

    }
}


sendMsgBtn.addEventListener("click", function () {
    handleSendMessage();
});
inputMsg.addEventListener("keypress", e => {
    if (e.key === "Enter") {
        handleSendMessage();
    }
});

function createMessageElement(sender, content, timestamp) {
    const msg = document.createElement("div");
    if (sender === local_user_nickname) {
        msg.className = "message-container";
    } else {
        msg.className = "message-container other-message";
    }
    msg.innerHTML = `<strong class="sender">${sender}</strong> <em class="date">${timestamp}</em><br><p class="message">${content}</p>`;
    return msg;
}

function appendMessageToDOM(msg) {
    const messages = document.getElementById("messages");
    messages.appendChild(msg);
    msg.scrollIntoView({behavior: "smooth"});
}

function subscribeToAllPrivateChats(ChatUser) {
    console.log("Subscribing to all private chats");
    users_list = JSON.parse(ChatUser.body);
    users_list.forEach(user => {
        if (user.username === local_user_nickname) {
            return;
        }
        let topic = [local_user_nickname, user.username].sort().join("-");
        console.log("Subscribed to " + topic);
        stompClient.subscribe(`/topic/private-chat/${topic}`, (ChatMessage) => {
            if(document.getElementById("chat-with").textContent !== user.username){
                const userContainers = document.querySelectorAll(".user-container");
                userContainers.forEach(container => {
                    if (container.querySelector(".user").textContent === user.username) {
                        let new_messages = container.querySelector(".new-message-counter")
                        if(new_messages.textContent.length === 0){
                            new_messages.textContent = "1";
                            container.parentNode.prepend(container);
                        }
                        else{
                            new_messages.textContent = parseInt(new_messages.textContent,10) + 1;
                            container.parentNode.prepend(container);
                        }
                    }
                });
                return;
            }
            const message = JSON.parse(ChatMessage.body);
            handleIncomingMessage(message);
        });
    });
}
function unsubscribeFromAllPrivateChats(){
    console.log("Unsubscribing from all private chats");
    users_list.forEach(user => {
        let topic = [local_user_nickname, user.username].sort().join("-");
        stompClient.unsubscribe(`/topic/${topic}`);
    });
}

function enterChat(nickname) {
    local_user_nickname = nickname;
    connect();
    console.log("Connected as: " + nickname);
    document.getElementById("chat-with").textContent = "Public chat";
    stompClient.onConnect = (frame) => {
        stompClient.subscribe('/topic/public-chat', (ChatMessage) => {
            if (document.getElementById("chat-with").textContent !== "Public chat") {
                return;
            }
            const message = JSON.parse(ChatMessage.body);
            handleIncomingMessage(message);
        });

        stompClient.subscribe('/topic/users', (ChatUser) => {
            loadUsers(ChatUser);

            if (users_list.length === 0) {
                subscribeToAllPrivateChats(ChatUser);
            }else{
                unsubscribeFromAllPrivateChats();
                subscribeToAllPrivateChats(ChatUser);
            }
        });
        registerUser(nickname);
        console.log("Registered as: " + nickname);
        document.querySelector("#connected-users-information-container").style.display = "flex";
        document.querySelector(".nickname-container").style.display = "none";
        document.querySelector(".chat-container").style.display = "block";
        document.querySelector("#input-msg").focus();
        document.querySelector(".chat-name-and-chat-container").style.display = "flex";
        loadPublicChat();
        document.querySelector("#public-chat-btn").addEventListener("click", function () {
            document.querySelector("#public-chat-btn").style.backgroundColor = "#007aff";
            document.querySelector("#public-chat-btn").classList.add("active");
            const toRemove = document.querySelectorAll(".user-container");
            toRemove.forEach(container => {
                    container.style.backgroundColor = "#fff";
            });
            clearChatContainer();
            loadPublicChat();
            document.getElementById("chat-with").textContent = "Public chat";
        });
        displayNickname(nickname);
    };
}

function registerUser(nickname) {
    if (stompClient.connected) {
        stompClient.publish({
            destination: "/app/register",
            body: JSON.stringify({
                'sender': nickname,
                'content': 'New Registration',
                'timestamp': new Date().toISOString()
            })
        });
    } else {
        console.error("STOMP client is not connected.");
    }
}

function displayNickname(nickname) {
    const nicknameDisplay = document.getElementById("nickname-display");
    nicknameDisplay.innerHTML = USER_ICON_HTML + '<p id="nickname">' + nickname + '</p>';
    nicknameDisplay.style.display = "flex";
}

function clearChatContainer(){
    const messages = document.getElementById("messages");
    messages.innerHTML = "";
}
function loadPublicChat(){
    fetch('/api/messages')
        .then(response => response.json())
        .then(messages => {
            messages.forEach(message => {
                const msgElement = createMessageElement(message.sender, message.content, message.timestamp);
                appendMessageToDOM(msgElement);
            });
        })
        .catch(error => console.error('Error fetching messages:', error));
}
function loadPrivateChat(interlocutor){
    document.querySelector("#public-chat-btn").style.backgroundColor = "black";
    let topic = [local_user_nickname, interlocutor].sort().join("-");
    fetch(`/api/privateMessages/${topic}`)
        .then(response => response.json())
        .then(messages => {
            messages.forEach(message => {
                const msgElement = createMessageElement(message.sender, message.content, message.timestamp);
                appendMessageToDOM(msgElement);
            });
        })
        .catch(error => console.error('Error fetching messages:', error));


}

function loadUsers(ChatUser, nickname) {
    const users = JSON.parse(ChatUser.body);
    users_list = users;
    const usersContainer = document.getElementById("users");
    usersContainer.innerHTML = "";
    users.forEach(user => {
        if (user.username === local_user_nickname) {
            return;
        }
        const userContainer = document.createElement("div");
        userContainer.className = "user-container";
        userContainer.style.display = "flex";

        const userElement = document.createElement("div");
        userElement.className = "user";
        userElement.textContent = user.username;

        const messageCounter = document.createElement("div");
        messageCounter.className = "new-message-counter";
        messageCounter.textContent = "";
        messageCounter.style.display = "flex";
        messageCounter.style.color = "#007aff";

        userContainer.appendChild(userElement);
        userContainer.appendChild(messageCounter);

        usersContainer.appendChild(userContainer);
        userContainer.addEventListener("click", function () {
            clearChatContainer();

            const toRemove = document.querySelectorAll(".user-container");
            toRemove.forEach(container => {
                if (container !== userContainer) {
                    container.style.backgroundColor = "#fff";
                }
            });
            userContainer.style.backgroundColor = "#007aff";
            document.getElementById("chat-with").textContent = user.username;
            loadPrivateChat(user.username);
            messageCounter.textContent = "";
        });
    });
    const userContainers = document.querySelectorAll(".user-container");
    userContainers.forEach(container => {
        if (container.querySelector(".user").textContent === document.getElementById("chat-with").textContent) {
            container.style.backgroundColor = "#007aff";
        }
    });

}
