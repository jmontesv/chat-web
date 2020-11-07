const socket = io();
const formEnviarMensaje = document.querySelector('.chat__form-enviar');
const inputNick = document.querySelector('.modal__input');
const modal = document.querySelector('.modal');
const interfaz = new UI();
let nickUser = '';


function entrarSala(nick) { 
  nickUser = nick;
  socket.emit('nuevo-usuario', roomName, nick);
  modal.style.display = 'none';
}

formEnviarMensaje.addEventListener('submit', (e) => {
  socket.emit('mensaje-sala', e.target.mensaje.value, roomName, nickUser);
  e.target.mensaje.value = '';
  e.preventDefault();
});

inputNick.addEventListener('keyup', (event) => {
  if (event.keyCode === 13) {
    entrarSala(event.target.value);
    event.preventDefault(); 
  };
})

// Acciones con socket.io
socket.on('join-usuario-sala', (nick, roomUsers) => {
  usersRoom = roomUsers;
  interfaz.actualizarUsuariosConectados(roomUsers);
  interfaz.mostrarMensaje(new Mensaje(
    [
      {
        type: 'span',
        texto: `${nick} se ha unido a la sala`, 
        estilo: 'mensaje__texto--blanco'
      }
    ], 'mensaje mensaje--fondo-oscuro').crearElemento());
});

socket.on('usuario-desconectado', (nick, roomUsers) => {
  for (id in roomUsers) {
    if (nick === roomUsers[id]) delete roomUsers[id];
  };
  usersRoom = roomUsers;
  
  interfaz.actualizarUsuariosConectados(roomUsers);
  interfaz.mostrarMensaje(new Mensaje(
    [
      {
        type: 'span',
        texto: `${nick} se ha ido de la sala`, 
        estilo: 'mensaje__texto--blanco'
      }
    ], 'mensaje mensaje--fondo-oscuro').crearElemento());
});

socket.on('mensaje', (contenido, nick, fecha) => { 
   interfaz.mostrarMensaje(new Mensaje(
     [
      {
        type: 'span',
        texto: nick,
        estilo: ''
      },
      {
        type: 'span',
        texto: contenido,
        estilo: ''
      },
      {
        type: 'span',
        texto: fecha.horas + ':' + fecha.minutos,
        estilo: ''
      }
     ], 'mensaje').crearElemento());
});
socket.on('mensaje-usuario', (nick, texto) => {console.log(nick, texto)});