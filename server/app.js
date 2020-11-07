const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const server = require('http').createServer(app);
const options = { /* ... */ };
const io = require('socket.io')(server, options);

const roomsDefault = [
    {
        nombre: 'general', 
        imagen: 'img/general.jpg'
    },
    {
        nombre: 'ocio', 
        imagen: 'img/ocio.jpg'
    },
    {
        nombre: 'trabajo', 
        imagen: 'img/trabajo.jpg'
    },
    {
        nombre: 'deporte', 
        imagen: 'img/deporte.jpg'
    },
    {
        nombre: 'musica', 
        imagen: 'img/musica.jpg'
    },
    {
        nombre: 'videojuegos', 
        imagen: 'img/videojuegos.jpeg'
    },
];

const users = {}
const rooms = { 
    general: {
        users: {}
    },
    ocio: {
        users: {}
    }
};
app.set('PORT', process.env.PORT || 3000)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname ,'views'));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => {
    res.status(200).render('index', {rooms: roomsDefault});
});
app.get('/:room', (req, res, next) => {
    const room = req.params.room;
    roomsDefault.map(({nombre}) => {return nombre}).includes(room) ? 
    res.status(200).render('room', {roomName: room, rooms: roomsDefault}) :
    next(new Error('La sala no existe'))
});
app.get('/isUser/:nick', (req, res, next) => {
    console.log(users);
    const nick = req.params.nick;
    let userEncontrado = false;
    for (id in users) {
        if (nick === users[id]) userEncontrado = true;      
    };
    userEncontrado ? res.send({id}) : next(new Error('No existe usuario con ese nick en la sala'));
});

app.use((err, req, res, next ) => {
    res.status(400).send(err.message);
});
// Socket.io
io.on('connection', (socket) => {
    socket.on('nuevo-usuario', (roomName, nick) => {
        users[socket.id] = nick;
        socket.join(roomName);
        const roomsUser = Object.keys(io.sockets.adapter.sids[socket.id]);
        roomsUser.forEach((room) => {
            if (!rooms.hasOwnProperty(room)) {
                rooms[room] = {
                    users: {
                        [socket.id]: nick
                    }        
                }
            } else {
                    const currentUsers = Object.assign({[socket.id]: nick}, rooms[room].users);
                    rooms[room].users = currentUsers;
            }    
        });
    //Enviamos evento con el nick del usuario a todos los usuarios de esa sala menos el del socket    
        io.to(roomName).emit('join-usuario-sala', users[socket.id], rooms[roomName].users);
    });
    //Enviar mensaje a los usuarios de una sala
    socket.on('mensaje-sala', (texto, room, nick) => { 
        io.to(room).emit('mensaje', texto, nick, { horas: new Date().getHours(), minutos: new Date().getMinutes()}) 
    });
    //Enviar mensaje a todos    
    socket.on('mensaje-global',(texto) => {
        io.emit('mensaje', {nick, texto});
    });

    // Enviar mensaje a usuario en particular
    socket.on('mensaje-privado', (id, nick, texto) => {
        socket.to(id).emit('mensaje-usuario', nick, texto )
    })
    //Reacciona cuando un usuario esta dejando la sala.
    socket.on('disconnecting', () => {

    // Enviamos el nombre del usuario a los demás clientes de las salas en las que está  y eliminamos el 
    // usuario de las salas en las que está, en la sala 'propia', eliminamos la 'sala' entera.  

        if (users[socket.id]) { // Comprobamos que la conexión (soket) sea un usuario ( que haya pasado por el evento nuevo usuario estando así en users)     
            const roomsOfSocket = Object.keys(socket.rooms); 
            roomsOfSocket.forEach((room) => {
                socket.to(room).emit('usuario-desconectado', users[socket.id], rooms[room].users);
                delete rooms[room].users[socket.id];
            });
            delete users[socket.id];
        }
    });
        
}); 

server.listen(app.get('PORT'), () => {
    console.log('Servidor corriendo en el puerto', app.get('PORT'))
});