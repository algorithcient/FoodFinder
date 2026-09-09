// ==========================================
// resumen.js
// Panel de resumen del restaurante — Supabase
// ==========================================

const SUPABASE_URL = "https://emqlgfmibvxdyipxubul.supabase.co";
const SUPABASE_KEY = "sb_publishable_sdiAONM5AeOf56mRe78fiw_YkP3uN46";
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

document.addEventListener("DOMContentLoaded", async function () {

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

    function esCancelado(estado) {
        return normalizarTexto(estado).includes("cancelado");
    }

    function inicioDelDia(fecha) {
        const copia = new Date(fecha);
        copia.setHours(0, 0, 0, 0);
        return copia;
    }

    function formatearMoneda(valor) {
        return "S/ " + Number(valor || 0).toFixed(2);
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

    // =====================
    // DATOS SUPABASE
    // =====================

    let platosRestaurante = [];
    let transaccionesRestaurante = [];

    async function cargarPlatos() {
        const { data, error } = await supabaseClient
            .from("platos")
            .select("*")
            .eq("restaurante_id", restauranteActual.id);

        if (error) {
            console.error("Error al cargar platos:", error);
            platosRestaurante = [];
            return;
        }

        platosRestaurante = data || [];
    }

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

    async function cargarDatos() {
        await Promise.all([cargarPlatos(), cargarTransacciones()]);
    }

    // =====================
    // SALUDO Y FECHA
    // =====================

    function renderizarSaludo() {
        const saludoElemento = document.getElementById("resumenSaludo");
        const fechaElemento = document.getElementById("resumenFecha");

        if (saludoElemento) {
            const hora = new Date().getHours();
            let saludo = "Buenos días";

            if (hora >= 12 && hora < 19) {
                saludo = "Buenas tardes";
            } else if (hora >= 19 || hora < 5) {
                saludo = "Buenas noches";
            }

            const primerNombre = String(usuarioActivo.nombre || "").split(" ")[0];
            saludoElemento.innerHTML = `${saludo}${primerNombre ? ", " + escaparHTML(primerNombre) : ""} 👋`;
        }

        if (fechaElemento) {
            fechaElemento.textContent = new Date().toLocaleDateString("es-PE", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric"
            });
        }
    }

    // =====================
    // MÉTRICAS (hoy vs ayer)
    // =====================

    function calcularMetricasDelDia(fechaObjetivo) {
        const inicio = inicioDelDia(fechaObjetivo);
        const fin = new Date(inicio);
        fin.setDate(fin.getDate() + 1);

        const pedidosDelDia = transaccionesRestaurante.filter((pedido) => {
            const fechaPedido = new Date(pedido.fecha || pedido.created_at);
            return fechaPedido >= inicio && fechaPedido < fin;
        });

        const pedidosValidos = pedidosDelDia.filter((pedido) => !esCancelado(pedido.estado));
        const pedidosCancelados = pedidosDelDia.filter((pedido) => esCancelado(pedido.estado));

        const ventas = pedidosValidos.reduce((suma, pedido) => suma + Number(pedido.total || 0), 0);
        const ticketPromedio = pedidosValidos.length > 0 ? ventas / pedidosValidos.length : 0;

        return {
            ventas,
            pedidos: pedidosDelDia.length,
            ticketPromedio,
            cancelados: pedidosCancelados.length
        };
    }

    function calcularVariacionPorcentual(hoy, ayer) {
        if (ayer === 0) {
            return hoy === 0 ? 0 : 100;
        }

        return ((hoy - ayer) / ayer) * 100;
    }

    function actualizarTarjetaVariacion(elementoId, hoy, ayer, unidad, invertirSentido) {
        const elemento = document.getElementById(elementoId);

        if (!elemento) {
            return;
        }

        const variacion = calcularVariacionPorcentual(hoy, ayer);
        const subio = variacion >= 0;
        const esBueno = invertirSentido ? !subio : subio;

        const flecha = subio ? "▲" : "▼";
        const claseColor = esBueno ? "resumen_sub_verde" : "resumen_sub_rojo";

        elemento.className = "resumen_sub " + claseColor;
        elemento.innerHTML = `${flecha} ${Math.abs(variacion).toFixed(0)}% vs ayer`;

        if (unidad === "unidades") {
            const diferencia = hoy - ayer;
            elemento.innerHTML = `${flecha} ${Math.abs(diferencia)} vs ayer`;
        }
    }

    function renderizarMetricas() {
        const hoy = calcularMetricasDelDia(new Date());

        const ayerFecha = new Date();
        ayerFecha.setDate(ayerFecha.getDate() - 1);
        const ayer = calcularMetricasDelDia(ayerFecha);

        document.getElementById("valorVentasHoy").textContent = formatearMoneda(hoy.ventas);
        document.getElementById("valorPedidosHoy").textContent = hoy.pedidos;
        document.getElementById("valorTicketPromedio").textContent = formatearMoneda(hoy.ticketPromedio);
        document.getElementById("valorCanceladosHoy").textContent = hoy.cancelados;

        actualizarTarjetaVariacion("variacionVentasHoy", hoy.ventas, ayer.ventas, "porcentaje", false);
        actualizarTarjetaVariacion("variacionPedidosHoy", hoy.pedidos, ayer.pedidos, "unidades", false);
        actualizarTarjetaVariacion("variacionTicketPromedio", hoy.ticketPromedio, ayer.ticketPromedio, "porcentaje", false);
        actualizarTarjetaVariacion("variacionCanceladosHoy", hoy.cancelados, ayer.cancelados, "unidades", true);
    }

    // =====================
    // GRÁFICO: VENTAS POR DÍA (últimos 7 días)
    // =====================

    function renderizarGraficoVentas() {
        const contenedor = document.getElementById("graficoVentasResumen");

        if (!contenedor) {
            return;
        }

        const dias = [];

        for (let i = 6; i >= 0; i--) {
            const fecha = new Date();
            fecha.setDate(fecha.getDate() - i);

            const metricas = calcularMetricasDelDia(fecha);

            dias.push({
                etiqueta: fecha.toLocaleDateString("es-PE", { weekday: "short" }),
                ventas: metricas.ventas
            });
        }

        const maximo = Math.max(...dias.map((dia) => dia.ventas), 1);

        contenedor.innerHTML = dias
            .map((dia) => {
                const alturaPorcentaje = Math.max((dia.ventas / maximo) * 100, 4);

                return `
                    <div class="barra-contenedor">
                        <div class="barra" style="height: ${alturaPorcentaje}%;" title="${formatearMoneda(dia.ventas)}"></div>
                        <span class="label-barra">${escaparHTML(dia.etiqueta)}</span>
                    </div>
                `;
            })
            .join("");
    }

    // =====================
    // PLATOS MÁS VENDIDOS
    // =====================

    function calcularPlatosMasVendidos() {
        const conteo = {};

        transaccionesRestaurante
            .filter((pedido) => !esCancelado(pedido.estado))
            .forEach((pedido) => {
                const items = Array.isArray(pedido.items) ? pedido.items : [];

                items.forEach((item) => {
                    const nombre = item.nombre || "Plato sin nombre";
                    const cantidad = Number(item.cantidad || 1);
                    conteo[nombre] = (conteo[nombre] || 0) + cantidad;
                });
            });

        return Object.entries(conteo)
            .map(([nombre, cantidad]) => ({ nombre, cantidad }))
            .sort((a, b) => b.cantidad - a.cantidad)
            .slice(0, 5);
    }

    function renderizarPlatosMasVendidos() {
        const contenedor = document.getElementById("platosMasVendidosResumen");

        if (!contenedor) {
            return;
        }

        const platosTop = calcularPlatosMasVendidos();

        if (platosTop.length === 0) {
            contenedor.innerHTML = `<p style="color:#6B7280; font-size: 13px;">Todavía no hay ventas registradas.</p>`;
            return;
        }

        const maximo = platosTop[0].cantidad;

        contenedor.innerHTML = platosTop
            .map((plato) => {
                const porcentaje = maximo > 0 ? (plato.cantidad / maximo) * 100 : 0;

                return `
                    <div class="item-plato">
                        <div class="info-plato">
                            <span>${escaparHTML(plato.nombre)}</span>
                            <span>${plato.cantidad} vendidos</span>
                        </div>
                        <div class="linea-fondo">
                            <div class="linea-verde" style="width: ${porcentaje}%;"></div>
                        </div>
                    </div>
                `;
            })
            .join("");
    }

    // =====================
    // PEDIDOS RECIENTES
    // =====================

    function obtenerClaseBadge(estado) {
        const estadoNormalizado = normalizarTexto(estado);

        if (estadoNormalizado.includes("cancelado")) {
            return "badge_cancelado";
        }

        if (estadoNormalizado.includes("entregado")) {
            return "badge_entregado";
        }

        if (estadoNormalizado.includes("preparando")) {
            return "badge_preparando";
        }

        return "badge_nuevo";
    }

    function obtenerTextoEstado(estado) {
        const estadoNormalizado = normalizarTexto(estado);

        if (estadoNormalizado.includes("cancelado")) {
            return "Cancelado";
        }

        if (estadoNormalizado.includes("entregado")) {
            return "Entregado";
        }

        if (estadoNormalizado.includes("preparando")) {
            return "Preparando";
        }

        return "Nuevo pedido";
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

    function renderizarPedidosRecientes() {
        const tbody = document.getElementById("tbody_pedidos_resumen");

        if (!tbody) {
            return;
        }

        const recientes = transaccionesRestaurante.slice(0, 8);

        if (recientes.length === 0) {
            tbody.innerHTML = `
                <tr class="tabla_fila">
                    <td class="tabla_td" colspan="7">
                        Todavía no tienes pedidos registrados.
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = recientes
            .map((pedido) => {
                return `
                    <tr class="tabla_fila">
                        <td class="tabla_td">${escaparHTML(pedido.pedido_id)}</td>
                        <td class="tabla_td">${escaparHTML(obtenerResumenPlatos(pedido.items))}</td>
                        <td class="tabla_td">${escaparHTML(pedido.cliente_nombre)}</td>
                        <td class="tabla_td">${Number(pedido.cantidad_total || 0)}</td>
                        <td class="tabla_td">
                            <span class="${obtenerClaseBadge(pedido.estado)}">
                                ${obtenerTextoEstado(pedido.estado)}
                            </span>
                        </td>
                        <td class="tabla_td">${formatearHora(pedido.fecha || pedido.created_at)}</td>
                        <td class="tabla_td tabla_acciones">
                            <button type="button" class="btn_editar btn-ver-pedido" data-id="${escaparHTML(pedido.pedido_id)}">
                                Ver más
                            </button>
                        </td>
                    </tr>
                `;
            })
            .join("");

        document.querySelectorAll(".btn-ver-pedido").forEach((btn) => {
            btn.onclick = function () {
                window.location.href = "pedidos_entrantes.html";
            };
        });
    }

    // Supabase: Resumen de inventario (insumos)
    async function renderizarResumenInventario() {
        const { data: insumos, error } = await supabaseClient
            .from("insumos")
            .select("cantidad")
            .eq("restaurante_id", restauranteActual.id);

        if (error) {
            console.error("Error al cargar resumen de insumos:", error);
            return;
        }

        const lista = insumos || [];
        const total = lista.length;
        const agotados = lista.filter((item) => Number(item.cantidad || 0) <= 0).length;
        const bajos = lista.filter((item) => {
            const cantidad = Number(item.cantidad || 0);
            return cantidad > 0 && cantidad <= 3;
        }).length;
        const ok = total - agotados - bajos;

        const elementoTotal = document.getElementById("resumenTotalInsumos");
        const elementoOk = document.getElementById("resumenStockOk");
        const elementoBajo = document.getElementById("resumenStockBajo");
        const elementoAgotado = document.getElementById("resumenStockAgotado");

        if (elementoTotal) elementoTotal.textContent = total;
        if (elementoOk) elementoOk.textContent = ok;
        if (elementoBajo) elementoBajo.textContent = bajos;
        if (elementoAgotado) elementoAgotado.textContent = agotados;
    }

    // =====================
    // RENDER GENERAL
    // =====================

    async function renderizarTodo() {
        renderizarSaludo();
        renderizarMetricas();
        renderizarGraficoVentas();
        renderizarPlatosMasVendidos();
        renderizarPedidosRecientes();
        await renderizarResumenInventario();
    }

    async function actualizarResumen() {
        await cargarDatos();
        await renderizarTodo();
    }

    // =====================
    // NAVEGACIÓN SUPERIOR PANEL
    // =====================

    function configurarNavegacionPanel() {
        const btnDashboard = document.getElementById("btn_dashboard");
        const btnLogoPanel = document.getElementById("btn-logo-panel");
        const btnPerfilPanel = document.getElementById("btn-perfil-panel");
        const btnSalir = document.getElementById("btn-salir");
        const btnActualizar = document.getElementById("btnActualizarResumen");

        if (btnDashboard) {
            btnDashboard.addEventListener("click", function (e) {
                e.preventDefault();
                window.location.href = "resumen.html";
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

        if (btnActualizar) {
            btnActualizar.addEventListener("click", async function () {
                btnActualizar.disabled = true;
                btnActualizar.textContent = "Actualizando...";

                await actualizarResumen();

                btnActualizar.disabled = false;
                btnActualizar.innerHTML = "&#128260; Actualizar";
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
    }

    // =====================
    // INIT
    // =====================

    await actualizarResumen();
    configurarNavegacionPanel();

});