const USER_ICON_HTML = '<img src="images/user.png" alt="User Icon"></img>';
const NICKNAME_ALERT = "Nickname must be at least 4 characters long.";
const NICKNAME_TAKEN_ALERT = "Nickname is already taken. Please choose another one.";
const NICKNAME_ERROR_ALERT = "An error occurred while checking the nickname. Please try again.";

const enterChatBtn = document.getElementById("send-username-btn");
const nicknameInput = document.getElementById("input-username");

enterChatBtn.addEventListener("click", function () {
    handleEnterChat();
});

nicknameInput.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
        handleEnterChat();
    }
});



function checkNickname(nickname) {
    return fetch(`/api/isUserRegistered?username=${nickname}`)
        .then(response => response.json())
        .then(isRegistered => {
            if (isRegistered) {
                alert(NICKNAME_TAKEN_ALERT);
                return false;
            }
            return true;
        })
        .catch(() => {
            alert(NICKNAME_ERROR_ALERT);
            return false;
        });
}

function handleEnterChat() {
    const nickname = nicknameInput.value;
    console.log("Nickname: " + nickname);
    if (nickname.length < 4) {
        alert(NICKNAME_ALERT);
        return;
    }
    checkNickname(nickname).then(isValid => {
        if (isValid) {
            displayNickname(nickname);
            enterChat(nickname);
        }
    });
}

