// setup an express server with socket io
const express = require('express');
const app = express();
const slides = require('./slides')
const server = require('http').Server(app);
const io = require('socket.io')(server);
const password = 'dixionANDsaahilprojectpassword'
let currentKey = null
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(express.static('public'))
app.set('views', 'src/views')
app.set('view engine', 'ejs')
app.get('/', (req,res) => {
    res.render('index')
})
app.get('/admin', (req,res) => {
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
})
server.listen(3000, () => {    
    console.log('Server running at port 3000')
})