require('dotenv').config()
const express = require('express');
const app = express();
const slides = require('./slides')
const server = require('http').Server(app);
const io = require('socket.io')(server);
const password = 'dixionANDsaahilprojectpassword'
const clients = []
let ans = []
const basicAuth = require('express-basic-auth')
let currentKey = null
let slide_index = 0
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
        // console.log('called#')
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
    // console.log(clients)
    // res.json(io.sockets.clients().connected)
    res.json({ clients: [...new Set(clients)].map(c => {
        return {
            id: c.id,
            handshake: c.handshake
        }
    })})
})
app.get('/protected/slide_index', (req,res) => {
    res.json({ index: slide_index })
})
app.get('/protected/slide_ans', (req,res) => {
    res.json({ ans })
})
app.get('/protected/slides', (req,res) => {
    res.json(slides)
})
app.get('/protected/example', (req,res) => {
    console.log('example')
    clients.forEach((c) => {
        c.emit('starting', slides[0])
    setTimeout((e) => {
        c.emit('question')
        setTimeout((e) => {
c.emit('lb', ['User 1', 'User 2', 'User 3'])
        }, 10_000)
    }, 5_000)
    })
    res.json({ status: true })
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
    // io.sockets.emit('starting', req.body.slide || 0)
    // setTimeout((e) => {
    //     // io.sockets.emit('question')
    // }, 1_500)
    if(slide_index < slides.length) {
    const i = slide_index
    clients.forEach((c) => {
        c.emit('starting', slides[i])
    setTimeout((e) => {
        c.emit('question')
    }, 3_000)
    })
    slide_index++;
    // socket.emit('question')
    res.json({ status: true })
} else {
    const e = clients.sort((a,b) => b.handshake.points - a.handshake.points).map(e => e.handshake.username)
    console.log(1, e)
    clients.forEach((c) => {
        console.log(33)
   c.emit('lb', e)
   console.log(44)
    })
    res.json({ status: false })
}
})
app.post('/protected/leaderboard', (req,res) => {
    console.log(0)
    const e = clients.sort((a,b) => b.handshake.points - a.handshake.points).map(e => e.handshake.username)
    console.log(1, e)
    clients.forEach((c) => {
        console.log(33)
   c.emit('lb', e)
   console.log(44)
    })
    res.json({ status: true })
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
    console.log('new client')
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
    socket.on('anwser', (anwser, points) => {
        if(!socket.handshake.points) socket.handshake.points = 0
        if(anwser === slides[slide_index - 1]?.questions[0]?.correct) socket.handshake.points += points
        console.log(anwser, socket.handshake.username, socket.handshake.points,slides[slide_index])
        ans.push({ username: socket.handshake.username, anwser, id: socket.id, points })
    })
})
socket.on('username', (username) => {
    socket.handshake.username = username
})
socket.on('disconnect', () => {
    // console.log(socket.handshake.username, 'disconnected')
    // const index = clients.indexOf(socket)
    // clients.splice(index, 1)
    // console.log('disconnected')
})
socket.on('connect', () => {
// ...
})
})
server.listen(process.env.PORT || 3000, () => {    
    console.log('Server running at port 3000')
})