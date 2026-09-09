// ==========================================
// inventario.js
// Inventario por restaurante — Supabase
// ==========================================

const SUPABASE_URL = "https://emqlgfmibvxdyipxubul.supabase.co";
const SUPABASE_KEY = "sb_publishable_sdiAONM5AeOf56mRe78fiw_YkP3uN46";
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

document.addEventListener("DOMContentLoaded", async function () {

    // =========================
    // ELEMENTOS
    // =========================

    const tbody = document.querySelector("#tbodyInventario");
    const btnAgregar = document.querySelector("#btnAgregarInsumo");
    const buscador = document.querySelector("#buscadorInventario");
    const filtroTodos = document.querySelector("#filtroTodos");
    const filtroDisponible = document.querySelector("#filtroDisponible");
    const filtroStockBajo = document.querySelector("#filtroStockBajo");
    const filtroAgotado = document.querySelector("#filtroAgotado");
    const filtrosEstado = document.querySelectorAll(".filtro_estado");
    const filtrosCategoria = document.querySelectorAll(".filtro_categoria");
    const totalInsumos = document.querySelector("#totalInsumos");
    const stockOk = document.querySelector("#stockOk");
    const stockBajo = document.querySelector("#stockBajo");
    const stockAgotado = document.querySelector("#stockAgotado");

    let filtroEstado = "todos";
    let categoriaActual = "Todas";

    const categorias = [
        "Carnes y Pescados",
        "Tubérculos",
        "Verduras y Hierbas",
        "Aceites y Grasas",
        "Cereales y Granos",
        "Frutas",
        "Lácteos y Derivados"
    ];

    // =========================
    // SESIÓN
    // =========================

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

    // =========================
    // RESTAURANTE (tabla restaurantes, ligado por usuario_id)
    // =========================

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

    // =========================
    // DATOS (Supabase)
    // =========================

    let inventario = [];

    async function cargar() {
        const { data, error } = await supabaseClient
            .from("insumos")
            .select("*")
            .eq("restaurante_id", restauranteActual.id)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error al cargar insumos:", error);
            inventario = [];
            return;
        }

        inventario = data || [];
    }

    // =========================
    // UTILIDADES
    // =========================

    function escaparHTML(texto) {
        return String(texto || "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }

    function normalizarTexto(texto) {
        return String(texto || "")
            .trim()
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");
    }

    function estado(item) {
        const cantidad = Number(item.cantidad || 0);

        if (cantidad <= 0) {
            return "agotado";
        }

        if (cantidad <= 3) {
            return "bajo";
        }

        return "ok";
    }

    function obtenerBadgeEstado(item) {
        const est = estado(item);

        if (est === "ok") {
            return `<span class="badge_disponible">✔ Disponible</span>`;
        }

        if (est === "bajo") {
            return `<span class="badge_stock_bajo">⚠ Stock bajo</span>`;
        }

        return `<span class="badge_agotado">❌ Agotado</span>`;
    }

    function obtenerClaseCantidad(item) {
        const est = estado(item);

        if (est === "bajo") {
            return "cantidad_amarillo";
        }

        if (est === "agotado") {
            return "cantidad_rojo";
        }

        return "cantidad_normal";
    }

    // =========================
    // RENDER
    // =========================

    function render(texto = "") {
        if (!tbody) {
            return;
        }

        tbody.innerHTML = "";

        const textoBusqueda = normalizarTexto(texto);

        const data = inventario.filter((item) => {
            const okTexto = normalizarTexto(item.nombre).includes(textoBusqueda);

            const okCategoria =
                categoriaActual === "Todas" ||
                item.categoria === categoriaActual;

            const est = estado(item);

            let okEstado = true;

            if (filtroEstado === "disponible") {
                okEstado = est === "ok";
            }

            if (filtroEstado === "bajo") {
                okEstado = est === "bajo";
            }

            if (filtroEstado === "agotado") {
                okEstado = est === "agotado";
            }

            return okTexto && okCategoria && okEstado;
        });

        if (inventario.length === 0) {
            tbody.innerHTML = `
                <tr class="tabla_fila">
                    <td class="tabla_td" colspan="5">
                        Todavía no tienes insumos registrados. Usa "Agregar insumo" para empezar.
                    </td>
                </tr>
            `;

            actualizarResumen();
            return;
        }

        if (data.length === 0) {
            tbody.innerHTML = `
                <tr class="tabla_fila">
                    <td class="tabla_td" colspan="5">
                        No hay insumos para mostrar con estos filtros.
                    </td>
                </tr>
            `;

            actualizarResumen();
            return;
        }

        data.forEach((item) => {
            const row = document.createElement("tr");
            row.classList.add("tabla_fila");

            row.innerHTML = `
                <td class="tabla_td tabla_insumo">
                    <span class="insumo_icono">📦</span>
                    ${escaparHTML(item.nombre)}
                </td>

                <td class="tabla_td">
                    ${escaparHTML(item.categoria)}
                </td>

                <td class="tabla_td">
                    <span class="${obtenerClaseCantidad(item)}">
                        ${Number(item.cantidad || 0)}
                    </span>
                </td>

                <td class="tabla_td">
                    ${obtenerBadgeEstado(item)}
                </td>

                <td class="tabla_td tabla_acciones">
                    <button type="button" class="btn_editar" data-id="${escaparHTML(item.id)}">
                        ✏ Editar
                    </button>

                    <button type="button" class="btn_eliminar" data-id="${escaparHTML(item.id)}">
                        🗑
                    </button>
                </td>
            `;

            tbody.appendChild(row);
        });

        actualizarResumen();
        eventos();
    }

    // =========================
    // RESUMEN
    // =========================

    function actualizarResumen() {
        if (totalInsumos) {
            totalInsumos.textContent = inventario.length;
        }

        if (stockOk) {
            stockOk.textContent = inventario.filter((item) => estado(item) === "ok").length;
        }

        if (stockBajo) {
            stockBajo.textContent = inventario.filter((item) => estado(item) === "bajo").length;
        }

        if (stockAgotado) {
            stockAgotado.textContent = inventario.filter((item) => estado(item) === "agotado").length;
        }
    }

    // =========================
    // MODAL
    // =========================

    function modal(item = null) {
        const div = document.createElement("div");
        div.className = "modal_bg";

        const opciones = categorias.map((categoria) => {
            return `
                <option value="${escaparHTML(categoria)}" ${item?.categoria === categoria ? "selected" : ""}>
                    ${escaparHTML(categoria)}
                </option>
            `;
        }).join("");

        div.innerHTML = `
            <div class="modal_box">
                <h3>${item ? "Editar insumo" : "Agregar insumo"}</h3>

                <label style="font-size: 13px; font-weight: 600;">Nombre del insumo</label>
                <input id="m_nombre" placeholder="Nombre" value="${item ? escaparHTML(item.nombre) : ""}">

                <label style="font-size: 13px; font-weight: 600; margin-top: 8px;">Categoría</label>
                <select id="m_categoria">
                    <option value="" disabled ${item ? "" : "selected"}>Selecciona categoría</option>
                    ${opciones}
                </select>

                <label style="font-size: 13px; font-weight: 600; margin-top: 8px;">Cantidad actual</label>
                <input id="m_cantidad" type="number" min="0" placeholder="Cantidad" value="${item ? Number(item.cantidad || 0) : ""}">

                <div class="modal_actions">
                    <button id="m_cancelar" type="button">Cancelar</button>
                    <button id="m_guardar" type="button">Guardar</button>
                </div>
            </div>
        `;

        document.body.appendChild(div);

        document.querySelector("#m_cancelar").onclick = function () {
            div.remove();
        };

        document.querySelector("#m_guardar").onclick = async function () {
            const nombre = document.querySelector("#m_nombre").value.trim();
            const categoria = document.querySelector("#m_categoria").value;
            const cantidad = parseInt(document.querySelector("#m_cantidad").value);

            if (!nombre || !categoria || isNaN(cantidad) || cantidad < 0) {
                alert("Completa nombre, categoría y cantidad con valores válidos.");
                return;
            }

            const btnGuardar = document.querySelector("#m_guardar");
            btnGuardar.disabled = true;
            btnGuardar.textContent = "Guardando...";

            if (item) {
                const { error } = await supabaseClient
                    .from("insumos")
                    .update({ nombre, categoria, cantidad })
                    .eq("id", item.id);

                if (error) {
                    console.error("Error al actualizar insumo:", error);
                    alert("No se pudo actualizar el insumo.");
                    btnGuardar.disabled = false;
                    btnGuardar.textContent = "Guardar";
                    return;
                }
            } else {
                const { error } = await supabaseClient
                    .from("insumos")
                    .insert([{
                        restaurante_id: restauranteActual.id,
                        nombre,
                        categoria,
                        cantidad
                    }]);

                if (error) {
                    console.error("Error al crear insumo:", error);
                    alert("No se pudo guardar el insumo.");
                    btnGuardar.disabled = false;
                    btnGuardar.textContent = "Guardar";
                    return;
                }
            }

            div.remove();
            await cargar();
            render(buscador ? buscador.value : "");
        };
    }

    // =========================
    // EVENTOS TABLA
    // =========================

    function eventos() {
        document.querySelectorAll(".btn_eliminar").forEach((boton) => {
            boton.onclick = async function () {
                const id = boton.dataset.id;
                const item = inventario.find((insumo) => String(insumo.id) === String(id));

                if (!item) return;

                const confirmar = confirm(`¿Deseas eliminar el insumo "${item.nombre}"?`);
                if (!confirmar) return;

                const { error } = await supabaseClient
                    .from("insumos")
                    .delete()
                    .eq("id", item.id);

                if (error) {
                    console.error("Error al eliminar insumo:", error);
                    alert("No se pudo eliminar el insumo.");
                    return;
                }

                await cargar();
                render(buscador ? buscador.value : "");
            };
        });

        document.querySelectorAll(".btn_editar").forEach((boton) => {
            boton.onclick = function () {
                const id = boton.dataset.id;
                const item = inventario.find((insumo) => String(insumo.id) === String(id));
                modal(item);
            };
        });
    }

    // =========================
    // FILTROS
    // =========================

    function activarFiltroEstado(botonActivo) {
        filtrosEstado.forEach((boton) => {
            boton.classList.remove("filtro_estado_activo");
        });

        if (botonActivo) {
            botonActivo.classList.add("filtro_estado_activo");
        }
    }

    if (filtroTodos) {
        filtroTodos.onclick = function () {
            filtroEstado = "todos";
            activarFiltroEstado(filtroTodos);
            render(buscador ? buscador.value : "");
        };
    }

    if (filtroDisponible) {
        filtroDisponible.onclick = function () {
            filtroEstado = "disponible";
            activarFiltroEstado(filtroDisponible);
            render(buscador ? buscador.value : "");
        };
    }

    if (filtroStockBajo) {
        filtroStockBajo.onclick = function () {
            filtroEstado = "bajo";
            activarFiltroEstado(filtroStockBajo);
            render(buscador ? buscador.value : "");
        };
    }

    if (filtroAgotado) {
        filtroAgotado.onclick = function () {
            filtroEstado = "agotado";
            activarFiltroEstado(filtroAgotado);
            render(buscador ? buscador.value : "");
        };
    }

    filtrosCategoria.forEach((btn) => {
        btn.onclick = function () {
            filtrosCategoria.forEach((boton) => {
                boton.classList.remove("filtro_categoria_activo");
            });

            btn.classList.add("filtro_categoria_activo");
            categoriaActual = btn.textContent.trim();
            render(buscador ? buscador.value : "");
        };
    });

    if (buscador) {
        buscador.oninput = function () {
            render(buscador.value);
        };
    }

    if (btnAgregar) {
        btnAgregar.onclick = function () {
            modal();
        };
    }

    // =====================
    // NAVEGACIÓN SUPERIOR
    // =====================

    function configurarNavegacionPanel() {
        const btnDashboard =
            document.getElementById("btn_dashboard") ||
            document.getElementById("btnDashboard") ||
            document.getElementById("btn_Dashboard");

        const btnLogoPanel = document.getElementById("btn-logo-panel");
        const btnBuscarPanel = document.getElementById("btn-buscar-panel");
        const btnPerfilPanel = document.getElementById("btn-perfil-panel");
        const btnSalir = document.getElementById("btn-salir");

        if (btnLogoPanel) {
            btnLogoPanel.addEventListener("click", function (e) {
                e.preventDefault();
                window.location.href = "pedidos_entrantes.html";
            });
        }

        if (btnDashboard) {
            btnDashboard.addEventListener("click", function (e) {
                e.preventDefault();
                window.location.href = "pedidos_entrantes.html";
            });
        }

        if (btnBuscarPanel) {
            btnBuscarPanel.addEventListener("click", function () {
                alert("Usa el buscador del inventario para encontrar insumos o navega desde el menú lateral.");
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
    }

    // =========================
    // START
    // =========================

    await cargar();
    render();
    configurarNavegacionPanel();

});