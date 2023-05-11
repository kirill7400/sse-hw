const http = require('http')
const Koa = require('koa')
const bodyParser = require('koa-bodyparser');
const cors = require('@koa/cors');
const json = require('koa-json');
const uuid = require('uuid')
const WS = require('ws')
const {cli} = require("forever");

const app = new Koa()
app.use(bodyParser());
app.use(cors());
app.use(json());

const chat = []
let users = []

/*app.use(async ctx => {
  let body = ctx.request.body

  if ('username' in body) {
    if (users.includes(body.username))
      ctx.response.body = { auth: false }
    else {
      ctx.response.body = { auth: true, users: users, chat: chat }
      users.push(body.username)
    }
  } else {
    users.splice(users.indexOf(body.user, 1))
  }

})*/

const server = http.createServer(app.callback())
const port = 7070

const wsServer = new WS.Server({ server })
wsServer.on('connection', (ws) => {
  ws.on('message', (e) => {
    let message = JSON.parse(e.toString())

    if ('method' in message) {
      if (users.some(d => d.user === message.value))
        sendAll(JSON.stringify({ auth: false }))
      else {
        users.push({user: message.value, userWS: ws})
        sendAll(JSON.stringify({ auth: true, user: message.value, users: users, chat: chat }))
      }
    } else {
      chat.push(message)
      let data = JSON.stringify({ chat, users })

      sendAll(data)
    }
  })

  ws.on('close', (e) => {
    users = users.filter((user) => user.userWS !== ws);
    let data = JSON.stringify({ chat, users })
    sendAll(data)
  })

  //ws.send(JSON.stringify({ users: users }))
})

const sendAll = (data) => {
  Array.from(wsServer.clients)
    .filter(client => client.readyState === WS.OPEN)
    .forEach(client => client.send(data))
}


server.listen(port, (error) => {
  if (error)
    console.log(error)
})
