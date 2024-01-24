// setup an express server with socket io
const express = require('express');
const app = express();
const slides = require('./slides')
const server = require('http').Server(app);
const io = require('socket.io')(server);
const password = 'dixionANDsaahilprojectpassword'
const clients = []
const basicAuth = require('express-basic-auth')
let currentKey = null
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(express.static('public'))
app.set('views', 'src/views')
app.set('view engine', 'ejs')
app.use('/protected/', (req,res,next) => {
    // console.log("before the auth")
    next()
},basicAuth({
    authorizer: (username, p) => {
        console.log('called#')
        return p === password
    },
    challenge: true,
    realm: 'Imb4T3st4pp',
}), (req,res,next) => {
    // console.log("after the auth")
    next()
})
app.get('/protected/auth', (req,res) => {
    res.json(req.auth)
})
// list all socket io clients
app.get('/protected/clients', (req,res) => {
    console.log(clients)
    // res.json(io.sockets.clients().connected)
    res.json({ clients: [...new Set(clients)].map(c => {
        return {
            id: c.id,
            handshake: c.handshake
        }
    })})
})
app.get('/protected/slides', (req,res) => {
    res.json(slides)
})
app.post('/protected/suspend_socket', (req,res) => {
    const { id } = req.body
    const client = clients.find(c => c.id === id)
    if(client) {
        client.emit('suspended')
        client.disconnect()
        res.json({ status: true })
    } else {
        res.json({ status: false })
    }
})
app.get('/protected/game_code', (req,res) => {
    res.json({ key: currentKey })
})
app.post('/protected/next_slide', (req,res) => {
    io.sockets.emit('next_slide', req.body.slide || 0)
})
app.get('/', (req,res) => {
    res.render('index')
})
app.get('/protected/admin', (req,res) => {
    res.render('admin')
})
app.get('/api/gen_key', (req,res) => {
    // console.log(req.query.auth, password)
if(req.query.auth == password) {
    const key = Math.random().toString().split('.')[1].slice(0,6)
    currentKey = key
    res.json({ key })
// res.status(201).end()
} else {
    res.status(401).end()
}
})
app.get('/api/verify_key', (req,res) => {
if(req.query.key === currentKey) {
    res.json({ status: true })
} else {
    res.json({ status: false })
}
})

io.on('connection', (socket) => {
socket.on('game_code', (code) => {
    clients.push(socket)
    console.log(currentKey, code)
    if(code === currentKey) {
        // socket.join(code)
        // socket.emit('game_code_verified')
        socket.emit('accepted')
        // More events Here
        // ...
        // socket.on('query_scores', () => {

        // })
    } else {
        socket.emit('rejected')
    }
})
socket.on('disconnect', () => {
    const index = clients.indexOf(socket)
    clients.splice(index, 1)
    // console.log('disconnected')
})
})
server.listen(3000, () => {    
    console.log('Server running at port 3000')
})