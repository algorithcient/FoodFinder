// ==========================================
// detalles.js
// Mis Pedidos del cliente
// Filtra pedidos por clienteEmail
// Permite dejar reseñas reales por restaurante
// Navegación completa
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    // =====================
    // VALIDACIÓN DE SESIÓN
    // =====================

    function obtenerUsuarioActivo() {
        try {
            return JSON.parse(
                localStorage.getItem("usuarioActivo")
            );
        } catch (error) {
            return null;
        }
    }

    function protegerMisPedidos() {
        const usuarioActivo =
            obtenerUsuarioActivo();

        if (!usuarioActivo) {
            alert("Debes iniciar sesión para ver tus pedidos.");

            window.location.href =
                "cuenta-cliente.html";

            return null;
        }

        if (usuarioActivo.rol !== "cliente") {
            alert("Esta sección es solo para consumidores.");

            window.location.href =
                "../../Gestion operativa de la cocina/pages/pedidos_entrantes.html";

            return null;
        }

        return usuarioActivo;
    }

    const usuarioActivo =
        protegerMisPedidos();

    if (!usuarioActivo) {
        return;
    }


    // =====================
    // ELEMENTOS DOM
    // =====================

    const tablaPedidoActivo =
        document.getElementById("tablaPedidoActivo");

    const tablaHistorialPedidos =
        document.getElementById("tablaHistorialPedidos");

    const mensajeSinPedido =
        document.getElementById("mensajeSinPedido");

    const mensajeSinHistorial =
        document.getElementById("mensajeSinHistorial");

    const mensajeErrorConexion =
        document.getElementById("mensajeErrorConexion");

    const btnHomePedidos =
        document.getElementById("btnHomePedidos");

    const btnMisPedidosActual =
        document.getElementById("btnMisPedidosActual");

    const btnCarrito =
        document.getElementById("btnCarrito");

    const btnUsuario =
        document.getElementById("btnUsuario");

    const seccionPedidosActivos =
        document.getElementById("seccionPedidosActivos");


    // =====================
    // RUTAS
    // =====================

    const RUTA_HOME =
        "../../Navegación/pages/home.html";

    const RUTA_CARRITO =
        "../../Gestión pago/pages/Carrito_compras1.html";

    const RUTA_CUENTA =
        "cuenta-cliente.html";


    // =====================
    // KEYS
    // =====================

    const KEY_ACTIVOS =
        "pedidosActivos";

    const KEY_HISTORIAL =
        "pedidosHistorial";

    const KEY_RESENAS =
        "foodfinder_resenas";

    const KEY_RESTAURANTES =
        "foodfinder_restaurantes";


    // =====================
    // LOCALSTORAGE
    // =====================

    function obtenerDatos(key) {
        try {
            return JSON.parse(
                localStorage.getItem(key)
            ) || [];
        } catch (error) {
            return [];
        }
    }

    function guardarDatos(key, data) {
        localStorage.setItem(
            key,
            JSON.stringify(data)
        );
    }


    // =====================
    // FILTRO POR CLIENTE
    // =====================

    function perteneceAlCliente(pedido) {
        if (!pedido) {
            return false;
        }

        if (pedido.clienteEmail) {
            return pedido.clienteEmail === usuarioActivo.correo;
        }

        return false;
    }

    function obtenerPedidosActivosDelCliente() {
        return obtenerDatos(KEY_ACTIVOS)
            .filter(perteneceAlCliente);
    }

    function obtenerHistorialDelCliente() {
        return obtenerDatos(KEY_HISTORIAL)
            .filter(perteneceAlCliente);
    }


    // =====================
    // UTILIDADES
    // =====================

    function escaparHTML(texto) {
        return String(texto || "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }

    function obtenerClaseEstado(estado) {
        const estadoNormalizado =
            String(estado || "")
                .toLowerCase();

        if (estadoNormalizado.includes("preparando")) {
            return "estado-preparando";
        }

        if (estadoNormalizado.includes("listo")) {
            return "estado-listo";
        }

        if (
            estadoNormalizado.includes("entregado") ||
            estadoNormalizado.includes("finalizado")
        ) {
            return "estado-entregado";
        }

        if (estadoNormalizado.includes("cancelado")) {
            return "estado-cancelado";
        }

        return "estado-recibido";
    }

    function formatearEstado(estado) {
        const estadoNormalizado =
            String(estado || "")
                .toLowerCase();

        if (estadoNormalizado.includes("preparando")) {
            return "Preparando pedido";
        }

        if (estadoNormalizado.includes("listo")) {
            return "Listo para entrega";
        }

        if (estadoNormalizado.includes("finalizado")) {
            return "Entregado";
        }

        if (estadoNormalizado.includes("cancelado")) {
            return "Cancelado";
        }

        return "Recibido";
    }

    function obtenerNombreRestaurante(pedido) {
        return (
            pedido.restauranteNombre ||
            "Restaurante FoodFinder"
        );
    }

    function obtenerPlatosPedido(pedido) {
        if (Array.isArray(pedido.items)) {
            return pedido.items
                .map((item) => {
                    const cantidad =
                        Number(item.cantidad || 1);

                    return `${cantidad}x ${item.nombre}`;
                })
                .join(", ");
        }

        return pedido.plato || "Pedido sin detalle";
    }

    function obtenerTotalPedido(pedido) {
        return Number(pedido.total || 0);
    }

    function pedidoYaTieneResena(pedido) {
        const resenas =
            obtenerDatos(KEY_RESENAS);

        return resenas.some((resena) => {
            return (
                resena.pedidoId === pedido.id &&
                resena.clienteEmail === usuarioActivo.correo
            );
        });
    }

    function pedidoPermiteResena(pedido) {
        const estado =
            String(pedido.estado || "")
                .toLowerCase();

        return (
            estado.includes("finalizado") ||
            estado.includes("entregado")
        );
    }

    // =====================
    // MOSTRAR PEDIDOS ACTIVOS
    // =====================

    function mostrarPedidoActivo() {
        const pedidosActivos =
            obtenerPedidosActivosDelCliente();

        tablaPedidoActivo.innerHTML =
            "";

        mensajeSinPedido.textContent =
            "";

        if (mensajeErrorConexion) {
            mensajeErrorConexion.style.display =
                "none";

            mensajeErrorConexion.textContent =
                "";
        }

        if (pedidosActivos.length === 0) {
            mensajeSinPedido.innerHTML = `
                No tienes pedidos en curso actualmente.
                <br><br>
                <button
                    type="button"
                    class="btn-resena btn-explorar-restaurantes">
                    Explorar restaurantes
                </button>
            `;

            configurarBotonesExplorar();
            return;
        }

        pedidosActivos.forEach((pedido) => {
            const estadoTexto =
                formatearEstado(pedido.estado);

            const fila =
                document.createElement("tr");

            fila.innerHTML = `
                <td>
                    <strong>${escaparHTML(pedido.id)}</strong>
                </td>

                <td>
                    <strong>${escaparHTML(obtenerPlatosPedido(pedido))}</strong>
                </td>

                <td>
                    <strong>${escaparHTML(pedido.cantidad)}</strong>
                </td>

                <td>
                    <strong>${escaparHTML(pedido.hora)}</strong>
                </td>

                <td>
                    <span class="${obtenerClaseEstado(pedido.estado)}">
                        ${escaparHTML(estadoTexto)}
                    </span>
                </td>

                <td>
                    <strong>25 - 35 min</strong>
                </td>

                <td>
                    ${escaparHTML(obtenerNombreRestaurante(pedido))}
                </td>
            `;

            tablaPedidoActivo.appendChild(fila);
        });
    }


    // =====================
    // MOSTRAR HISTORIAL
    // =====================

    function mostrarHistorialPedidos() {
        const historial =
            obtenerHistorialDelCliente();

        tablaHistorialPedidos.innerHTML =
            "";

        mensajeSinHistorial.textContent =
            "";

        if (historial.length === 0) {
            mensajeSinHistorial.innerHTML = `
                Todavía no tienes pedidos anteriores.
                <br><br>
                <button
                    type="button"
                    class="btn-resena btn-explorar-restaurantes">
                    Hacer mi primer pedido
                </button>
            `;

            configurarBotonesExplorar();
            return;
        }

        historial.forEach((pedido) => {
            const estadoTexto =
                formatearEstado(pedido.estado);

            const total =
                obtenerTotalPedido(pedido);

            const tieneResena =
                pedidoYaTieneResena(pedido);

            const permiteResena =
                pedidoPermiteResena(pedido);

            const fila =
                document.createElement("tr");

            fila.innerHTML = `
                <td>
                    <strong>${escaparHTML(pedido.id)}</strong>
                </td>

                <td>
                    <strong>${escaparHTML(obtenerPlatosPedido(pedido))}</strong>
                </td>

                <td>
                    <strong>${escaparHTML(pedido.cantidad)}</strong>
                </td>

                <td>
                    <strong>${escaparHTML(pedido.hora)}</strong>
                </td>

                <td>
                    ${escaparHTML(obtenerNombreRestaurante(pedido))}
                </td>

                <td>
                    S/ ${total.toFixed(2)}
                </td>

                <td>
                    <span class="${obtenerClaseEstado(pedido.estado)}">
                        ${escaparHTML(estadoTexto)}
                    </span>
                </td>

                <td>
                    ${
                        permiteResena
                            ? `
                                <button
                                    type="button"
                                    class="btn-resena"
                                    data-pedido-id="${escaparHTML(pedido.id)}"
                                    ${tieneResena ? "disabled" : ""}>
                                    ${tieneResena ? "Reseña enviada" : "Dejar reseña"}
                                </button>
                            `
                            : `
                                <button
                                    type="button"
                                    class="btn-resena"
                                    disabled>
                                    Pedido cancelado
                                </button>
                            `
                    }
                </td>
            `;

            tablaHistorialPedidos.appendChild(fila);
        });

        configurarBotonesResena();
    }


    // =====================
    // RESEÑAS
    // =====================

    function obtenerPedidoHistorialPorId(idPedido) {
        return obtenerHistorialDelCliente()
            .find((pedido) => {
                return pedido.id === idPedido;
            });
    }

    function crearEstrellasTexto(calificacion) {
        const estrellasLlenas =
            "★".repeat(calificacion);

        const estrellasVacias =
            "☆".repeat(5 - calificacion);

        return estrellasLlenas + estrellasVacias;
    }

    function abrirModalResena(pedido) {
        if (!pedido) {
            return;
        }

        if (pedidoYaTieneResena(pedido)) {
            alert("Ya dejaste una reseña para este pedido.");
            return;
        }

        if (!pedidoPermiteResena(pedido)) {
            alert("Solo puedes dejar reseñas en pedidos entregados.");
            return;
        }

        const modal =
            document.createElement("div");

        modal.className =
            "modal_bg";

        modal.innerHTML = `
            <div class="modal_box">
                <h3>Dejar reseña</h3>

                <p style="margin-bottom: 12px;">
                    Restaurante:
                    <strong>${escaparHTML(obtenerNombreRestaurante(pedido))}</strong>
                </p>

                <label style="font-size: 13px; font-weight: 600;">
                    Calificación
                </label>

                <select id="resena-calificacion">
                    <option value="5">★★★★★ - Excelente</option>
                    <option value="4">★★★★☆ - Muy bueno</option>
                    <option value="3">★★★☆☆ - Bueno</option>
                    <option value="2">★★☆☆☆ - Regular</option>
                    <option value="1">★☆☆☆☆ - Malo</option>
                </select>

                <label style="font-size: 13px; font-weight: 600; margin-top: 10px;">
                    Comentario
                </label>

                <textarea
                    id="resena-comentario"
                    placeholder="Escribe tu experiencia con el pedido..."
                    rows="4"></textarea>

                <div class="modal_actions">
                    <button id="resena-cancelar" type="button">
                        Cancelar
                    </button>

                    <button id="resena-guardar" type="button">
                        Guardar reseña
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        document.getElementById("resena-cancelar")
            .addEventListener("click", () => {
                modal.remove();
            });

        document.getElementById("resena-guardar")
            .addEventListener("click", () => {
                const calificacion =
                    Number(
                        document.getElementById("resena-calificacion").value
                    );

                const comentario =
                    document.getElementById("resena-comentario")
                        .value
                        .trim();

                if (!comentario) {
                    alert("Escribe un comentario para guardar la reseña.");
                    return;
                }

                guardarResena(
                    pedido,
                    calificacion,
                    comentario
                );

                modal.remove();
                mostrarHistorialPedidos();
            });
    }

    function guardarResena(pedido, calificacion, comentario) {
        const resenas =
            obtenerDatos(KEY_RESENAS);

        const nuevaResena = {
            id: "resena_" + Date.now(),
            pedidoId: pedido.id,
            restauranteId: pedido.restauranteId || "",
            ownerEmail: pedido.ownerEmail || "",
            restauranteNombre: pedido.restauranteNombre || obtenerNombreRestaurante(pedido),
            clienteEmail: usuarioActivo.correo,
            clienteNombre: usuarioActivo.nombre || "Cliente FoodFinder",
            calificacion: calificacion,
            estrellas: crearEstrellasTexto(calificacion),
            comentario: comentario,
            fecha: new Date().toISOString()
        };

        resenas.push(nuevaResena);

        guardarDatos(
            KEY_RESENAS,
            resenas
        );

        actualizarRatingRestaurante(
            nuevaResena.restauranteId,
            nuevaResena.ownerEmail
        );

        alert("Reseña guardada correctamente.");
    }

    function actualizarRatingRestaurante(restauranteId, ownerEmail) {
        const restaurantes =
            obtenerDatos(KEY_RESTAURANTES);

        const resenas =
            obtenerDatos(KEY_RESENAS)
                .filter((resena) => {
                    return (
                        resena.restauranteId === restauranteId ||
                        resena.ownerEmail === ownerEmail
                    );
                });

        if (resenas.length === 0) {
            return;
        }

        const promedio =
            resenas.reduce((suma, resena) => {
                return suma + Number(resena.calificacion || 0);
            }, 0) / resenas.length;

        const restaurantesActualizados =
            restaurantes.map((restaurante) => {
                if (
                    restaurante.id === restauranteId ||
                    restaurante.ownerEmail === ownerEmail
                ) {
                    return {
                        ...restaurante,
                        rating: Number(promedio.toFixed(1)),
                        reviews: resenas.length
                    };
                }

                return restaurante;
            });

        guardarDatos(
            KEY_RESTAURANTES,
            restaurantesActualizados
        );
    }

    function configurarBotonesResena() {
        const botonesResena =
            document.querySelectorAll(".btn-resena:not(.btn-explorar-restaurantes)");

        botonesResena.forEach((boton) => {
            boton.addEventListener("click", () => {
                const idPedido =
                    boton.dataset.pedidoId;

                const pedido =
                    obtenerPedidoHistorialPorId(idPedido);

                abrirModalResena(pedido);
            });
        });
    }


    // =====================
    // PERFIL CLIENTE
    // =====================

    function abrirModalPerfil() {
        const modal =
            document.createElement("div");

        modal.className =
            "modal_bg";

        modal.innerHTML = `
            <div class="modal_box">
                <h3>Perfil del cliente</h3>

                <p>
                    <strong>Nombre:</strong>
                    ${escaparHTML(usuarioActivo.nombre || "Cliente FoodFinder")}
                </p>

                <p>
                    <strong>Correo:</strong>
                    ${escaparHTML(usuarioActivo.correo || "Sin correo")}
                </p>

                <p>
                    <strong>Rol:</strong>
                    Consumidor
                </p>

                <div class="modal_actions">
                    <button id="perfil-home" type="button">
                        Ir al Home
                    </button>

                    <button id="perfil-cerrar-sesion" type="button">
                        Cerrar sesión
                    </button>

                    <button id="perfil-cerrar" type="button">
                        Cerrar
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        document.getElementById("perfil-home")
            .addEventListener("click", () => {
                window.location.href =
                    RUTA_HOME;
            });

        document.getElementById("perfil-cerrar-sesion")
            .addEventListener("click", () => {
                const confirmar =
                    confirm("¿Deseas cerrar sesión?");

                if (!confirmar) {
                    return;
                }

                localStorage.removeItem("usuarioActivo");

                window.location.href =
                    RUTA_CUENTA;
            });

        document.getElementById("perfil-cerrar")
            .addEventListener("click", () => {
                modal.remove();
            });
    }


    // =====================
    // NAVEGACIÓN
    // =====================

    function configurarBotonesExplorar() {
        const botonesExplorar =
            document.querySelectorAll(".btn-explorar-restaurantes");

        botonesExplorar.forEach((boton) => {
            boton.addEventListener("click", () => {
                window.location.href =
                    RUTA_HOME;
            });
        });
    }

    if (btnHomePedidos) {
        btnHomePedidos.addEventListener("click", () => {
            window.location.href =
                RUTA_HOME;
        });
    }

    if (btnMisPedidosActual) {
        btnMisPedidosActual.addEventListener("click", () => {
            if (seccionPedidosActivos) {
                seccionPedidosActivos.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            }
        });
    }

    if (btnCarrito) {
        btnCarrito.addEventListener("click", () => {
            window.location.href =
                RUTA_CARRITO;
        });
    }

    if (btnUsuario) {
        btnUsuario.addEventListener("click", () => {
            abrirModalPerfil();
        });
    }


    // =====================
    // INIT
    // =====================

    mostrarPedidoActivo();
    mostrarHistorialPedidos();

});