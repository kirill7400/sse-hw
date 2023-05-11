import './assets/style.css'

const headers = {
  'Content-Type': 'application/json'
}

const ws = new WebSocket('ws://localhost:7070/ws');
let user = {
  auth: false,
  username: ''
}

ws.addEventListener('message', (e) => {
  let list = JSON.parse(e.data)

  if ('auth' in list)
    if (list.auth) {
      user.username === list.user && authUser()
    } else alert('Пользователь с таким именем уже есть, укажите другое')

  if (user.auth) {
    createUserList(list.users)
    createChat(list.chat)
  }

  console.log(list)
})

const authBtn = document.querySelector('.auth-btn')
const authInput = document.querySelector('.auth-input')

authBtn.addEventListener('click', () => {
  const authUsername = authInput.value
  if (!authUsername) return

  ws.send(JSON.stringify({ method: 'auth', value: authUsername }))

  user.username = authUsername
  authInput.value = ''
})

const messageBtn = document.querySelector('.btn-chat')
const messageInput = document.querySelector('.chat-input')

messageBtn.addEventListener('click', () => {
  const message = messageInput.value
  if (!message) return

  ws.send(JSON.stringify({ user: user.username, value: message }))
  messageInput.value = ''
})

const authUser = () => {
  const chat = document.querySelector('.chat-desk')
  const auth = document.querySelector('.auth')

  chat.style.display = 'flex'
  auth.style.display = 'none'

  user.auth = true
}

const createUserList = (list) => {
  if (!list.length)
    return

  const userList = document.querySelector('.users-list')
  Array.from(userList.children).forEach(item => item.remove())

  list.forEach(item => {
    let div = document.createElement('div')
    div.classList.add('user')
    div.textContent = item.user
    userList.insertBefore(div, null)
  })

}

const createChat = (chatData) => {
  const chat = document.querySelector('.chat')
  Array.from(chat.children).forEach(item => item.remove())

  chatData.forEach(item => {
    console.log(item)
    let message = item

    let divMess = document.createElement('div')
    let divInfo = document.createElement('div')
    let divData = document.createElement('div')

    divMess.classList.add('message')
    divInfo.classList.add('message-info')
    divData.classList.add('message-data')

    if (message.user === user.username)
      divMess.classList.add('outgoing-message')
    else divMess.classList.add('incoming-message')

    divInfo.textContent = message.user
    divData.textContent = message.value

    divMess.insertBefore(divInfo, null)
    divMess.insertBefore(divData, null)
    chat.insertBefore(divMess, null)
  })
}
