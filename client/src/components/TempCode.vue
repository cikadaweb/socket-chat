<template>
  <div>

  </div>
</template>

<script setup>
console.log("Sanity check from room.js.");
const chatBar = new SimpleBar(document.querySelector('#chatLog'));
const chatScrollContainer = chatBar.getScrollElement();
const chatLog = chatBar.getContentElement();
let chatSocket = null;    //сокет для текущего чата

const chatMessageInput = document.querySelector("#chatMessageInput");
const messageForm = document.querySelector(".chat-input-section");

const buttonUnreadMessage = document.querySelector(".button-unread-message");
const indicatorUnreadMessage = buttonUnreadMessage.querySelector('.count-unread-messages');

let counterUnreadMessages = 0;
let pageUp = 0;
let pageDown = 0;
let dialogDate = null;
let isLastUpMessage = false;
let isLastDownMessage = false;
let isTyping = false;
let timeoutId = null;

const optionsForObserver = {
    root: null,
    rootMargin: '0px',
    threshold: 0.05,
}

const callbackForObserver = (entries) => {
    console.log(observer.root)
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            setTimeout(() => {
                chatSocket.send(JSON.stringify({
                    "type": "read_message",
                    "id": entry.target.id,
                }));
            }, 800)

            observer.unobserve(entry.target);
        }
    });
};

const observer = new IntersectionObserver(callbackForObserver, optionsForObserver);

// adds a new option to 'usersSelector'
// function usersSelectorAdd(username) {
//     if (document.querySelector('li[data-username="' + username + '"]')) return;
//     let newLi = document.createElement("li");
//     newLi.setAttribute("data-username", username);
//     newLi.classList.add("mx-3");
//     newLi.innerHTML = username;
//     allUsersSelector.appendChild(newLi);
// }

// removes an option from 'usersSelector'
// function onlineUsersSelectorRemove(username) {
//     let oldLi= document.querySelector('li[data-username="' + username + '"]');
//     if (oldLi !== null) {
//         oldLi.style.listStyleType = "none";
//     }
// }

// adds a new option to 'allUsersSelector'
// function onlineUsersSelectorAdd(username) {
//     let onlineUser = document.querySelector('li[data-username="' + username + '"]');
//     if (onlineUser) {
//         onlineUser.style.listStyleType = "disc";
//     }
// }

function updateNotReadMessageButton(type, count) {
    if (type === 'increment') {
        counterUnreadMessages++
    } else if (type === 'decrement') {
        counterUnreadMessages--
    } else if (type === 'updateCount') {
        counterUnreadMessages = count
    }

    if (counterUnreadMessages > 0) {
        indicatorUnreadMessage.textContent = counterUnreadMessages;
        buttonUnreadMessage.classList.remove('d-none');
    } else {
        buttonUnreadMessage.classList.add('d-none');
    }
}

// function onMessagesDownClick() {
//     const count = countNotReadMessage.textContent;
//
//     if (count) {
//         pageDown = Math.floor(count/20);
//         chatSocket.send(JSON.stringify({
//                "type": "paginate_down",
//                "page": pageDown,
//         }));
//         chatSocket.send(JSON.stringify({
//                "type": "paginate_down",
//                "page": pageDown + 1,
//         }));
//         isLastDownMessage = true;
//         // observer.unobserve();
//         // chatLog.textContent = '';
//     }
// }

function addNewMessage(messageData) {
    const message = messageTemplate.cloneNode(true);
    message.setAttribute("id", messageData.message_id);
    message.querySelector('.conversation-name').textContent = messageData.user;
    message.querySelector('.conversation-content').textContent = messageData.message;
    message.querySelector('.chat-time').textContent = messageData.time;

    if (messageData.user === currentUser) {
        message.classList.add("right");
    }

    if (!messageData.read_message) {
        message.classList.add("not-read");
    }

    return message;
}

function addDateToChat(date) {
    let li = document.createElement('li');
    li.innerHTML = `<div className="chat-day-title"><span className="title">${date}</span></div>`;
    return li
}

function addNewMessageList(messageList, directionPaginate = "down") {
    if (messageList?.length) {
        if (directionPaginate === 'up') {
            messageList.forEach(msg => {
                // if (msg.date !== dialogDate) {
                //     chatLog.prepend(addDateToChat(msg.date))
                //     dialogDate = msg.date;
                // }
                chatLog.prepend(addNewMessage(msg));
            })
            // chatLog.scrollTop = '0';
        } else if (directionPaginate === 'down') {
            messageList.forEach(msg => {
                chatLog.append(addNewMessage(msg));
            })
        }
    }
}

function addUserTyping(message, user = null) {
    // if (!message || user === currentUser) {
    //     formTyping.classList.remove('formTyping_active')
    //     formTypingMessage.textContent = "";
    //     return;
    // }
    // formTyping.classList.add('formTyping_active')
    // formTypingMessage.textContent = message;
}

function onInputChatMessageChange() {
    if (isTyping) {
        chatSocket.send(JSON.stringify({
            "type": "user_stop_typing",
            "user": currentUser,
        }));
    }
    isTyping = false;
}

function onInputChatMessageInput() {
    if (!isTyping) {
        chatSocket.send(JSON.stringify({
            "type": "user_typing",
            "user": currentUser,
        }));
    }

    isTyping = true;
    clearTimeout(timeoutId);

    timeoutId = setTimeout(function () {
        if (isTyping) {
            chatSocket.send(JSON.stringify({
                "type": "user_stop_typing",
                "user": currentUser,
            }));
        }
        isTyping = false;
    }, 2000);
}

function onChatLogScroll() {
    if (chatScrollContainer.scrollTop === 0 && !isLastUpMessage && chatLog.textContent !== '') {
        chatSocket.send(JSON.stringify({
            "type": "paginate_up",
            "page": pageUp + 1,
        }));
    } else if (chatScrollContainer.scrollHeight === chatScrollContainer.scrollTop + chatScrollContainer.clientHeight && !isLastDownMessage && chatLog.textContent !== '') {
        chatSocket.send(JSON.stringify({
            "type": "paginate_down",
            "page": pageDown + 1,
        }));
    }
}

function observeNewMessages() {
    const unreadMessages = document.querySelectorAll('.not-read');
    unreadMessages.forEach(message => {
        if (message.querySelector('.conversation-name').textContent !== currentUser) {
            observer.observe(message);
        }
    })
}

function readMessage(id) {
    let elements = document.getElementsByClassName("conversation-item");
    for (let i = 0; i < elements.length; i++) {
        if (elements[i].id === id) {
            elements[i].classList.remove('not-read');
            break
        }
    }
}

/** скрол до нового сообщения или в конец диалога */
function paginate(messageList) {
    if (messageList?.length > 1) {
        const unreadMessage = messageList.find(msg => ((msg.user !== currentUser) && !msg.read_message))
        if (unreadMessage) {
            document.getElementById(unreadMessage.message_id).scrollIntoView({block: "center"});
        } else {
            chatScrollContainer.scrollTop = chatLog.scrollHeight;
        }
    }
    // else if (messageList?.length === 1) {
    //     if (messageList[0].user === currentUser) {
    //         chatScrollContainer.scrollTop = chatLog.scrollHeight;
    //     }
    // }
}

chatMessageInput.addEventListener("change", onInputChatMessageChange);
chatMessageInput.addEventListener("input", onInputChatMessageInput);
chatScrollContainer.addEventListener("scroll", onChatLogScroll);

messageForm.onsubmit = function (evt) {
    evt.preventDefault();
    if (!chatMessageInput.value.trim()) return;
    chatSocket.send(JSON.stringify({
        "type": "chat_message",
        "message": chatMessageInput.value,
        "user": currentUser,
    }));
    chatMessageInput.value = "";
};

document.addEventListener("beforeunload", function () {
    chatMessageInput.removeEventListener("change", onInputChatMessageChange);
    chatMessageInput.removeEventListener("input", onInputChatMessageInput);
    chatScrollContainer.removeEventListener("scroll", onChatLogScroll);
});

function resetChatbox() {
    // закрытие открытого сокета
    if (chatSocket) {
        chatSocket.close()
    }

    chatLog.innerHTML = '';

    pageUp = 0;
    pageDown = 0;
    isLastUpMessage = false;
    isLastDownMessage = false;
    isTyping = false;
    timeoutId = null;
}

function connect() {
    resetChatbox()
    chatSocket = new WebSocket("ws://" + window.location.host + "/ws/chat/" + roomName + "/");
    chatSocket.onopen = function (e) {
        console.log("Successfully connected to the WebSocket.");
    }
    chatSocket.onclose = function (e) {
        console.log("WebSocket connection closed");
    };
    chatSocket.onmessage = function (e) {
        const data = JSON.parse(e.data);

        switch (data.type) {

            case "start_messages":
                addNewMessageList(data.messages, 'down');
                observeNewMessages();
                updateNotReadMessageButton('updateCount', data?.unread_count);
                paginate(data.messages);

                if (!data.messages?.length) {
                    chatLog.innerHTML = "<div class=\"notification\">Нет сообщений ¯\\_(ツ)_/¯</div>" + chatLog.innerHTML;
                }

                break;
            case "chat_message":
                chatLog.append(addNewMessage(data.message));
                observeNewMessages();

                if (data.message.user === currentUser) {
                    chatScrollContainer.scrollTop = chatLog.scrollHeight;
                } else {
                    updateNotReadMessageButton('increment');
                }

                break;
            case "user_join":
                chatLog.innerHTML += "<li class=\"notification\">" + data.user + " присоединился</li>";
                // usersSelectorAdd(data.user);
                break;
            case "online_users":
                // for (let i = 0; i < data.users.length; i++) {
                //     onlineUsersSelectorAdd(data.users[i]);
                // }
                break;
            case "user_leave":
                chatLog.innerHTML += "<li class=\"notification\">" + data.user + " вышел из комнаты </li>";
                // onlineUsersSelectorRemove(data.user);
                break;
            case "paginate_up":
                debugger;
                let currentScrollHeight = chatLog.scrollHeight;
                addNewMessageList(data.messages, "up");

                if (!data.last_page) {
                    pageUp++;
                } else {
                    chatLog.innerHTML = "<div class=\"notification\">Больше сообщений  нет ¯\\_(ツ)_/¯</div>" + chatLog.innerHTML;
                    isLastUpMessage = true;
                }

                chatScrollContainer.scrollTop = chatLog.scrollHeight - currentScrollHeight;

                //костыль так как у бека сломана пагинация
                observeNewMessages();
                break;
            case "paginate_down":
                debugger;
                addNewMessageList(data.messages, "down");

                if (!data.last_page) {
                    pageDown++;
                } else {
                    isLastDownMessage = true;
                }

                // addCountOfNotReadMessages(data?.unread_count);
                paginate(data.messages);

                observeNewMessages();
                break;
            case "user_typing":
                addUserTyping(data.message, data.user);
                break;
            case "user_stop_typing":
                addUserTyping(data.message);
                break;
            case "read_message":
                updateNotReadMessageButton('decrement');
                readMessage(data.message_id);
                break;
            default:
                console.error("Unknown message type!");
                break;
        }
    };

    chatSocket.onerror = function (err) {
        console.log("WebSocket encountered an error: " + err.message);
        console.log("Closing the socket.");
        chatSocket.close();
    }
}
</script>

<style lang="scss" scoped>

</style>