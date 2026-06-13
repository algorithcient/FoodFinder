const tablaPedidoActivo = document.getElementById("tablaPedidoActivo");
const tablaHistorialPedidos = document.getElementById("tablaHistorialPedidos");

const mensajeSinPedido = document.getElementById("mensajeSinPedido");
const mensajeSinHistorial = document.getElementById("mensajeSinHistorial");
const mensajeErrorConexion = document.getElementById("mensajeErrorConexion");

const btnCarrito = document.getElementById("btnCarrito");
const btnUsuario = document.getElementById("btnUsuario");

/* cambiar a true para simular una cuenta nueva sin pedidos */
const cuentaNueva = false;

/* cambiar a true para probar el fallo de conexión */
const falloConexion = false;

/* datos de prueba para presentación */
const pedidoActivo = {
    numero: "#1089",
    nombre: "Lomo saltado",
    cantidad: "1",
    hora: "13:43",
    estado: "Preparando pedido",
    tiempo: "25 min",
    restaurante: "Restaurante de Pepe"
};

const historialPedidos = [
    {
        numero: "#1080",
        nombre: "Ají de gallina",
        cantidad: "2",
        hora: "13:43",
        restaurante: "Victoria's food",
        precio: "S/. 20",
        estado: "Entregado"
    },
    {
        numero: "#1079",
        nombre: "Salchipapa",
        cantidad: "3",
        hora: "9:43",
        restaurante: "Pollería Tarrillos",
        precio: "S/. 24",
        estado: "Entregado"
    }
];

function obtenerClaseEstado(estado) {
    if (estado === "Recibido") {
        return "estado-recibido";
    }

    if (estado === "Preparando pedido") {
        return "estado-preparando";
    }

    if (estado === "Listo") {
        return "estado-listo";
    }

    if (estado === "Entregado") {
        return "estado-entregado";
    }

    return "estado-recibido";
}

function mostrarPedidoActivo() {
    tablaPedidoActivo.innerHTML = "";
    mensajeSinPedido.textContent = "";

    if (cuentaNueva === true) {
        mensajeSinPedido.textContent = "No tienes pedidos en curso actualmente.";
        return;
    }

    const fila = document.createElement("tr");

    const columnaNumero = document.createElement("td");
    const columnaNombre = document.createElement("td");
    const columnaCantidad = document.createElement("td");
    const columnaHora = document.createElement("td");
    const columnaEstado = document.createElement("td");
    const columnaTiempo = document.createElement("td");
    const columnaRestaurante = document.createElement("td");

    const textoNumero = document.createElement("strong");
    const textoNombre = document.createElement("strong");
    const textoCantidad = document.createElement("strong");
    const textoHora = document.createElement("strong");
    const textoTiempo = document.createElement("strong");
    const estado = document.createElement("span");

    textoNumero.textContent = pedidoActivo.numero;
    textoNombre.textContent = pedidoActivo.nombre;
    textoCantidad.textContent = pedidoActivo.cantidad;
    textoHora.textContent = pedidoActivo.hora;
    estado.textContent = pedidoActivo.estado;
    textoTiempo.textContent = pedidoActivo.tiempo;
    columnaRestaurante.textContent = pedidoActivo.restaurante;

    estado.classList.add(obtenerClaseEstado(pedidoActivo.estado));

    columnaNumero.appendChild(textoNumero);
    columnaNombre.appendChild(textoNombre);
    columnaCantidad.appendChild(textoCantidad);
    columnaHora.appendChild(textoHora);
    columnaEstado.appendChild(estado);
    columnaTiempo.appendChild(textoTiempo);

    fila.appendChild(columnaNumero);
    fila.appendChild(columnaNombre);
    fila.appendChild(columnaCantidad);
    fila.appendChild(columnaHora);
    fila.appendChild(columnaEstado);
    fila.appendChild(columnaTiempo);
    fila.appendChild(columnaRestaurante);

    tablaPedidoActivo.appendChild(fila);
}

function mostrarHistorialPedidos() {
    tablaHistorialPedidos.innerHTML = "";
    mensajeSinHistorial.textContent = "";

    if (cuentaNueva === true) {
        mensajeSinHistorial.textContent = "Todavía no tienes pedidos anteriores.";
        return;
    }

    historialPedidos.forEach(function (pedido) {
        const fila = document.createElement("tr");

        const columnaNumero = document.createElement("td");
        const columnaNombre = document.createElement("td");
        const columnaCantidad = document.createElement("td");
        const columnaHora = document.createElement("td");
        const columnaRestaurante = document.createElement("td");
        const columnaPrecio = document.createElement("td");
        const columnaEstado = document.createElement("td");
        const columnaAccion = document.createElement("td");

        const textoNumero = document.createElement("strong");
        const textoNombre = document.createElement("strong");
        const textoCantidad = document.createElement("strong");
        const textoHora = document.createElement("strong");
        const estado = document.createElement("span");
        const botonResena = document.createElement("button");

        textoNumero.textContent = pedido.numero;
        textoNombre.textContent = pedido.nombre;
        textoCantidad.textContent = pedido.cantidad;
        textoHora.textContent = pedido.hora;
        columnaRestaurante.textContent = pedido.restaurante;
        columnaPrecio.textContent = pedido.precio;
        estado.textContent = pedido.estado;
        botonResena.textContent = "Dejar reseña";

        estado.classList.add(obtenerClaseEstado(pedido.estado));
        botonResena.classList.add("btn-resena");
        botonResena.type = "button";

        columnaNumero.appendChild(textoNumero);
        columnaNombre.appendChild(textoNombre);
        columnaCantidad.appendChild(textoCantidad);
        columnaHora.appendChild(textoHora);
        columnaEstado.appendChild(estado);
        columnaAccion.appendChild(botonResena);

        fila.appendChild(columnaNumero);
        fila.appendChild(columnaNombre);
        fila.appendChild(columnaCantidad);
        fila.appendChild(columnaHora);
        fila.appendChild(columnaRestaurante);
        fila.appendChild(columnaPrecio);
        fila.appendChild(columnaEstado);
        fila.appendChild(columnaAccion);

        tablaHistorialPedidos.appendChild(fila);
    });
}

function mostrarFalloConexion() {
    if (falloConexion === true) {
        mensajeErrorConexion.style.display = "block";
        mensajeErrorConexion.textContent = "No se pudo cargar el estado del pedido. Intente nuevamente.";
    } else {
        mensajeErrorConexion.style.display = "none";
        mensajeErrorConexion.textContent = "";
    }
}

btnCarrito.addEventListener("click", function () {
    alert("Carrito de compras");
});

btnUsuario.addEventListener("click", function () {
    alert("Perfil de usuario");
});

mostrarPedidoActivo();
mostrarHistorialPedidos();
mostrarFalloConexion();