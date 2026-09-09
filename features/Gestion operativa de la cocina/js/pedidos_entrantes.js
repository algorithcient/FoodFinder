// ==========================================
// pedidos_entrantes.js
// Gestión de pedidos por restaurante — Supabase
// (usa la misma tabla "transacciones" que resumen.js)
// ==========================================

const SUPABASE_URL = "https://emqlgfmibvxdyipxubul.supabase.co";
const SUPABASE_KEY = "sb_publishable_sdiAONM5AeOf56mRe78fiw_YkP3uN46";
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

document.addEventListener("DOMContentLoaded", async function () {

    // =====================
    // ELEMENTOS DOM
    // =====================

    const tbodyActivos = document.getElementById("tbody_pedidos_activos");
    const tbodyHistorial = document.getElementById("tbody_historial");

    const btnDashboard = document.getElementById("btn_dashboard");
    const btnLogoPanel = document.getElementById("btn-logo-panel");
    const btnBuscarPanel = document.getElementById("btn-buscar-panel");
    const btnPerfilPanel = document.getElementById("btn-perfil-panel");
    const btnSalir = document.getElementById("btn-salir");

    // =====================
    // SESIÓN
    // =====================

    function obtenerUsuarioActivo() {
        try {
            return JSON.parse(localStorage.getItem("usuarioActivo"));
        } catch (error) {
            return null;
        }
    }

    const usuarioActivo = obtenerUsuarioActivo();

    if (!usuarioActivo) {
        alert("Debes iniciar sesión para acceder al panel.");
        window.location.href = "../../Gestion de pedido/Pages/cuenta-cliente.html";
        return;
    }

    if (usuarioActivo.rol !== "cocinero") {
        alert("Esta sección es solo para emprendedores gastronómicos.");
        window.location.href = "../../Navegación/pages/home.html";
        return;
    }

    // =====================
    // RESTAURANTE (tabla restaurantes, ligado por usuario_id)
    // =====================

    async function obtenerRestauranteActivo(usuario) {
        const { data: restaurante, error } = await supabaseClient
            .from("restaurantes")
            .select("*")
            .eq("usuario_id", usuario.id)
            .maybeSingle();

        if (error) {
            console.error("Error al buscar restaurante:", error);
        }

        if (restaurante) {
            return restaurante;
        }

        const nuevoRestaurante = {
            nombre: "Restaurante de " + String(usuario.nombre || "Emprendedor").split(" ")[0],
            telefono: usuario.telefono || "",
            direccion: usuario.direccion_negocio || "Dirección pendiente",
            categoria: "Emprendimiento gastronómico",
            cocina: "Emprendimiento gastronómico",
            descripcion: "Restaurante registrado en FoodFinder.",
            distrito: "Lima",
            estado: "Abierto",
            usuario_id: usuario.id
        };

        const { data: creado, error: errorCrear } = await supabaseClient
            .from("restaurantes")
            .insert([nuevoRestaurante])
            .select()
            .single();

        if (errorCrear) {
            console.error("Error al crear restaurante:", errorCrear);
            alert("No se pudo preparar tu restaurante. Intenta recargar la página.");
            return null;
        }

        return creado;
    }

    const restauranteActual = await obtenerRestauranteActivo(usuarioActivo);

    if (!restauranteActual) {
        return;
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

    function normalizarTexto(texto) {
        return String(texto || "").trim().toLowerCase();
    }

    function formatearHora(fecha) {
        const fechaPedido = new Date(fecha);

        if (isNaN(fechaPedido.getTime())) {
            return "--:--";
        }

        return fechaPedido.toLocaleTimeString("es-PE", {
            hour: "2-digit",
            minute: "2-digit"
        });
    }

    function obtenerResumenPlatos(items) {
        if (!Array.isArray(items) || items.length === 0) {
            return "Sin detalle";
        }

        const primerItem = items[0].nombre || "Plato";

        if (items.length === 1) {
            return primerItem;
        }

        return `${primerItem} +${items.length - 1} más`;
    }

    function esEstadoFinal(estado) {
        const estadoNormalizado = normalizarTexto(estado);
        return estadoNormalizado.includes("entregado") || estadoNormalizado.includes("cancelado");
    }

    function obtenerClaseEstadoHistorial(estado) {
        return normalizarTexto(estado).includes("cancelado") ? "badge_cancelado" : "badge_entregado";
    }

    function obtenerTextoEstadoHistorial(estado) {
        return normalizarTexto(estado).includes("cancelado") ? "Cancelado" : "Entregado";
    }

    // =====================
    // DATOS SUPABASE
    // =====================

    let transaccionesRestaurante = [];

    async function cargarTransacciones() {
        const { data, error } = await supabaseClient
            .from("transacciones")
            .select("*")
            .eq("restaurante_id", String(restauranteActual.id))
            .order("fecha", { ascending: false });

        if (error) {
            console.error("Error al cargar transacciones:", error);
            transaccionesRestaurante = [];
            return;
        }

        transaccionesRestaurante = data || [];
    }

    // =====================
    // RENDER ACTIVOS (confirmado / preparando)
    // =====================

    function renderActivos() {
        if (!tbodyActivos) {
            return;
        }

        const activos = transaccionesRestaurante.filter((pedido) => !esEstadoFinal(pedido.estado));

        if (activos.length === 0) {
            tbodyActivos.innerHTML = `
                <tr class="tabla_fila">
                    <td class="tabla_td" colspan="7">
                        No tienes pedidos activos por ahora.
                    </td>
                </tr>
            `;
            return;
        }

        tbodyActivos.innerHTML = activos
            .map((pedido) => {
                const esNuevo = !normalizarTexto(pedido.estado).includes("preparando");

                const claseBadge = esNuevo ? "badge_nuevo" : "badge_preparando";
                const textoBadge = esNuevo ? "Nuevo pedido" : "Preparando pedido";

                const botonEstado = esNuevo
                    ? `<button type="button" class="btn_preparar" data-id="${escaparHTML(pedido.id)}">👨‍🍳 Preparar</button>`
                    : `<button type="button" class="btn_finalizar" data-id="${escaparHTML(pedido.id)}">✔ Finalizar</button>`;

                return `
                    <tr class="tabla_fila">
                        <td class="tabla_td">${escaparHTML(pedido.pedido_id)}</td>
                        <td class="tabla_td">${escaparHTML(obtenerResumenPlatos(pedido.items))}</td>
                        <td class="tabla_td">${escaparHTML(pedido.cliente_nombre)}</td>
                        <td class="tabla_td">${Number(pedido.cantidad_total || 0)}</td>
                        <td class="tabla_td">
                            <span class="${claseBadge}">${textoBadge}</span>
                        </td>
                        <td class="tabla_td">${formatearHora(pedido.fecha || pedido.created_at)}</td>
                        <td class="tabla_td tabla_acciones">
                            ${botonEstado}
                            <button type="button" class="btn_cancelar" data-id="${escaparHTML(pedido.id)}">✖ Cancelar</button>
                        </td>
                    </tr>
                `;
            })
            .join("");
    }

    // =====================
    // RENDER HISTORIAL (entregado / cancelado)
    // =====================

    function renderHistorial() {
        if (!tbodyHistorial) {
            return;
        }

        const historial = transaccionesRestaurante.filter((pedido) => esEstadoFinal(pedido.estado));

        if (historial.length === 0) {
            tbodyHistorial.innerHTML = `
                <tr class="tabla_fila">
                    <td class="tabla_td" colspan="7">
                        Todavía no tienes pedidos finalizados o cancelados.
                    </td>
                </tr>
            `;
            return;
        }

        tbodyHistorial.innerHTML = historial
            .map((pedido) => {
                return `
                    <tr class="tabla_fila">
                        <td class="tabla_td">${escaparHTML(pedido.pedido_id)}</td>
                        <td class="tabla_td">${escaparHTML(obtenerResumenPlatos(pedido.items))}</td>
                        <td class="tabla_td">${escaparHTML(pedido.cliente_nombre)}</td>
                        <td class="tabla_td">${Number(pedido.cantidad_total || 0)}</td>
                        <td class="tabla_td">S/ ${Number(pedido.total || 0).toFixed(2)}</td>
                        <td class="tabla_td">
                            <span class="${obtenerClaseEstadoHistorial(pedido.estado)}">
                                ${obtenerTextoEstadoHistorial(pedido.estado)}
                            </span>
                        </td>
                        <td class="tabla_td">${formatearHora(pedido.fecha || pedido.created_at)}</td>
                    </tr>
                `;
            })
            .join("");
    }

    async function refrescarTablas() {
        await cargarTransacciones();
        renderActivos();
        renderHistorial();
    }

    // =====================
    // ACCIONES (actualizan Supabase)
    // =====================

    async function cambiarEstadoPedido(id, nuevoEstado, mensajeConfirmacion) {
        if (mensajeConfirmacion) {
            const confirmar = confirm(mensajeConfirmacion);
            if (!confirmar) {
                return;
            }
        }

        const { error } = await supabaseClient
            .from("transacciones")
            .update({ estado: nuevoEstado })
            .eq("id", id);

        if (error) {
            console.error(`Error al actualizar pedido a ${nuevoEstado}:`, error);
            alert(
                "No se pudo actualizar el estado del pedido.\n\n" +
                "Detalle: " + (error.message || JSON.stringify(error))
            );
            return;
        }

        await refrescarTablas();
    }

    // =====================
    // EVENT DELEGATION
    // =====================

    if (tbodyActivos) {
        tbodyActivos.addEventListener("click", function (e) {
            const botonPreparar = e.target.closest(".btn_preparar");
            const botonFinalizar = e.target.closest(".btn_finalizar");
            const botonCancelar = e.target.closest(".btn_cancelar");

            if (botonPreparar) {
                cambiarEstadoPedido(botonPreparar.dataset.id, "preparando");
                return;
            }

            if (botonFinalizar) {
                cambiarEstadoPedido(
                    botonFinalizar.dataset.id,
                    "entregado",
                    "¿Confirmas que este pedido fue finalizado?"
                );
                return;
            }

            if (botonCancelar) {
                cambiarEstadoPedido(
                    botonCancelar.dataset.id,
                    "cancelado",
                    "¿Seguro que deseas cancelar este pedido?"
                );
                return;
            }
        });
    }

    // =====================
    // NAVEGACIÓN SUPERIOR PANEL RESTAURANTE
    // =====================

    if (btnLogoPanel) {
        btnLogoPanel.addEventListener("click", function (e) {
            e.preventDefault();
            window.location.href = "pedidos_entrantes.html";
        });
    }

    if (btnDashboard) {
        btnDashboard.addEventListener("click", function (e) {
            e.preventDefault();
            window.location.href = "resumen.html";
        });
    }

    if (btnBuscarPanel) {
        btnBuscarPanel.addEventListener("click", function () {
            alert("Puedes revisar tus pedidos activos, platos, inventario, estadísticas y configuración desde el menú lateral.");
        });
    }

    if (btnPerfilPanel) {
        btnPerfilPanel.addEventListener("click", function () {
            window.location.href = "configuracion.html";
        });
    }

    if (btnSalir) {
        btnSalir.addEventListener("click", function (e) {
            e.preventDefault();

            const confirmar = confirm("¿Deseas cerrar sesión?");
            if (!confirmar) return;

            localStorage.removeItem("usuarioActivo");
            alert("Sesión cerrada correctamente.");
            window.location.href = "../../../index.html";
        });
    }

    const btnMenuMobile = document.getElementById("btnMenuMobile");
    const btnCerrarSidebar = document.getElementById("btnCerrarSidebar");
    const sidebar = document.querySelector(".dashboard_sidebar");

    if (btnMenuMobile && btnCerrarSidebar && sidebar) {
        btnMenuMobile.addEventListener("click", () => {
            sidebar.classList.add("activo");
        });

        btnCerrarSidebar.addEventListener("click", () => {
            sidebar.classList.remove("activo");
        });
    }

    // =====================
    // INIT
    // =====================

    await refrescarTablas();

});