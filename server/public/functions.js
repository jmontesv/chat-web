
function Mensaje(contenido, estilo) {
    this.contenido = contenido; // Array de informacioón que tendrá el mensaje. ([{texto: ' ejemplo', estilo: 'ejemplo'}])
    this.estilo = estilo;

    this.crearElemento = function() {
        const contMensaje = document.createElement('div');
        contMensaje.className = this.estilo;
        this.contenido.forEach(elemento => {
            const contElemento = document.createElement(elemento.type);
            contElemento.textContent = elemento.texto;
            contElemento.className = elemento.estilo;
            contMensaje.appendChild(contElemento);
        });
        return contMensaje;
    };
};

function UI() {
    this.cajaMensajes = document.querySelector('.chat__caja-mensajes');
    this.usuariosSala = document.querySelector('.chat__usuarios-sala');
    this.cajaUsuariosConectados = document.querySelector('.chat__usuarios-contenedor');

    this.mostrarMensaje = function (mensaje) {
        this.cajaMensajes.appendChild(mensaje);
    }
    this.actualizarUsuariosConectados = function(usuarios) {
        this.usuariosSala.removeChild(this.cajaUsuariosConectados);
        //creamos de nuevo el conetendor de usuarioa para añadir el nuevo
        this.cajaUsuariosConectados = document.createElement('div');
        this.cajaUsuariosConectados.className = 'chat__usuarios-contenedor';
        this.eventoEnviarMensajePrivado();
        Object.values(usuarios).forEach((nick) => {
            const nickTexto = document.createElement('span');
            nickTexto.textContent = nick;
            nickTexto.className = 'nick';
            this.cajaUsuariosConectados.appendChild(nickTexto);
          });
        this.usuariosSala.appendChild(this.cajaUsuariosConectados);  
    }
    this.eventoEnviarMensajePrivado = function() {
        this.cajaUsuariosConectados.addEventListener('click', (event) => {
            fetch(`http://localhost:3000/isUser/${event.target.textContent}`)
                .then(response => response.json())
                .then((id) => {
                    socket.emit('mensaje-privado', id, nickUser, 'Mensaje privado')
                })
                .catch((err) => {console.log(err)})
        });
    }
}
