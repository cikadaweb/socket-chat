<template>
  <div class="chat-container">

    <!-- Name Input window -->
    <div v-if="isShowModal">
        <div class="modal-background">
          <div class="modal-content">
            <form @submit.prevent="handleConnect">
              <h3> Enter your name to join chat </h3>
              <input type="text" v-model="currentUser" placeholder="Enter your name" />
              <br>
              <button type="submit"> Connect </button>
            </form>
          </div>
        </div>
      </div>

    <div v-show="!isShowModal" class="chat-window">
      <div class="messages-container" ref="messagesContainer">
        <ul class="message-list">
          <li v-for="(item, index) in chatMessages" :key="index">
            <div v-if="item.username === 'admin'" class="message message__info">
              {{ item.message }}
              <hr>
            </div>
            <div v-else class="message" :class="[item.username === currentUser ? 'right-bubble' : 'left-bubble']">
              <b>{{ item.username }}</b>: <em>{{ item.message }}</em>
            </div>
          </li>
        </ul>
        <ObserverArea @intersect="intersected"/>
      </div>

      <div class="chat-input">
          <form @submit.prevent="sendMessage()">
            <input type="text" v-model="enteredMessage" placeholder="Write message..." />
            <button class="chat-input__button" type="submit"><i class="bi bi-send "></i> </button>
          </form>
          <button class="chat-signout-btn" @click="signOutChat">Выйти из чата <i class="bi bi-box-arrow-right"></i></button>
      </div>
    </div>
  </div>
</template>


<script setup>
/* eslint-disable */
  import { computed, onMounted, ref, watch, watchEffect } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import ObserverArea from '@/components/ObserverArea.vue';

  const router = useRouter();
  const route = useRoute();

  const chatWs = ref(null);

  const chatMessages = ref([]);
  // const chatMessages = ref([{"username":"admin","message":"Пользователь с именем User06.09.2023, 15:16:36 вошел в чат."},{"username":"User06.09.2023, 15:16:36","message":"привет"},{"username":"User06.09.2023, 15:16:22","message":"Как дела?"},{"username":"User06.09.2023, 15:16:36","message":"хорошо, у тебя как?"},{"username":"User06.09.2023, 15:16:22","message":"тоже"},{"username":"admin","message":"Пользователь с именем User [858] вошел в чат."},{"username":"User [42]","message":"sadsa"},{"username":"User [42]","message":"asdasd"},{"username":"User [42]","message":"asdasd"},{"username":"User [858]","message":"asdasd"}]);
  
  const enteredMessage = ref('');

  const currentUser = ref('User [' + Math.floor(Math.random() * 1000) + ']');

  const isShowModal = ref(true);

  const messagesContainer = ref(null);
  const scrollToBottomBtn = ref(null);

  const isShowScrollBtn = ref(false);

  const handleConnect = () => {
    isShowModal.value = false
  }

  const signOutChat = () => {
    const messageData = { username: 'admin', message: `Пользователь с именем ${currentUser.value} покинул чат.`};
    sendMessage(messageData);
    chatWs.value.close(1000, "работа закончена");
    router.push({ name: 'MainPage' });
  }

  const sendMessage = (messageData) => {
    if(messageData) {
      chatWs.value.send(JSON.stringify(messageData))
      chatMessages.value.push(messageData)
    } else {
      const messageData = { username: currentUser.value, message: enteredMessage.value};
      chatWs.value.send(JSON.stringify(messageData))
      chatMessages.value.push(messageData)
      enteredMessage.value = null;
    }
  }

  const intersected = () => {
    const downButton = document.createElement('button');
    const messageList = messagesContainer.value.querySelector('.message-list');
    downButton.classList.add('chat-scrolltobottom-btn');
    downButton.textContent = 'Кнопка';
    messageList.append(downButton);
    console.log('messageList: ', downButton);
    
  }

  watchEffect(() => {
    // на случай, если пользователь поменял чат
    if (route.params.chatId) {

      chatWs.value = new WebSocket(`ws://localhost:3000`);

      // отправляем на сервер информацию при открытии соединения о том, кто установил соединение с чатом
      chatWs.value.onopen = function () {
        const messageData = { username: 'admin', message: `Пользователь с именем ${currentUser.value} вошел в чат.`};
        sendMessage(messageData);
      };

      // при получении сообщения добавляем в локальный массив сообщение
      chatWs.value.onmessage = (event) => {
        const message = JSON.parse(event.data);
        chatMessages.value.push(message);
      }
    }
  });

  // watch(messagesContainer.value.clientHeight, (currentValue, oldValue) => {
  //   if(currentValue && oldValue) {
  //     console.log(currentValue);
  //     console.log(oldValue);
  //   }
  // });

</script>
  
<style scoped>
.chat-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.modal-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}
.modal-content {
  background-color: #3d2aac;
  padding: 15px;
  border-radius: 5px;
  box-shadow: 0px 0px 10px #333;
  text-align: center;
  color: white;
}
.modal-content input{
  padding: 10px;
  border-radius: 5px;
  border: none;
  margin-bottom: 10px;
}
.modal-content button{
  padding: 10px;
  border-radius: 5px;
  border: none;
  background-color: #9b59b6;
  color: white;
}
.chat-window {
  display: flex;
  flex-direction: column;
}

.chat-messages{
  padding: 10px;
  margin-bottom: 10px;
  border-radius: 5px;
}

.chat-input {
  background-color: #f2f2f2;
  padding: 30px;
  display: flex;
  align-items: center;
  position: fixed;
  bottom: 0;
  width: 100%;
}
.chat-input input[type="text"] {
  padding: 15px;
  border: none;
  border-radius: 5px 0px 0px 5px;
}
.chat-input__button {
  background-color: #3d2aac;
  color: #fff;
  padding: 15px;
  border: none;
  border-radius: 0px 5px 5px 0px;
}
.message-container{
  display: inline-block;
  padding: 0 0 0 10px;
  vertical-align: top;
}
.right-bubble{
  background-color: #3d2aac;
  border-radius: 10px 10px 10px 0px;
  padding: 10px 15px;
  word-wrap: break-word;
  margin: 10px;
  float: right;
  color: white;
  width:50%;
}
.left-bubble{
  background-color:#9b59b6;
  border-radius: 10px 10px 0px 10px;
  padding: 10px 15px;
  word-wrap: break-word;
  margin: 10px;
  float: left;
  color: white;
  width: 50%;
}
.messages-container {
  position: relative;
  max-height: 400px;
  overflow: auto;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgb(0 0 0 / 30%);
}

/* .message__info {
  text-align: center;
  font-size: 18px;
  font-weight: 700;
  padding: 12px 24px;
} */

.message-list {
  display: flex;
  flex-direction: column;
  gap: 15px;

  list-style: none;
  padding: 0;
  margin: 0;
}
.message {

}
.message__info {
  text-align: center;
}

.chat-signout-btn {
  background-color: rgb(255, 62, 62);
  color: #fff;
  padding: 15px;
  border: none;
  border-radius: 5px;
  color: #fff;
  margin-left: 15px;
}

.chat-scrolltobottom-btn {
  position: absolute;
  right: 10px;
  z-index: 20;
  width: 50px;
  height: 50px;
  color: orange;
  cursor: pointer;
  border-radius: 50px;
}
.chat-scrolltobottom-btn::before {
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  font-size: 20px;
  content: '↓'
}
</style>