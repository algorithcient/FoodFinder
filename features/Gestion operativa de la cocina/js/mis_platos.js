// ==========================================
// mis_platos.js
// Gestión de platos por restaurante — Supabase
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
    // ELEMENTOS
    // =====================

    const tbody =
        document.getElementById("tbodyPlatos") ||
        document.querySelector("table tbody");

    const btnAgregar =
        document.getElementById("btnAgregarPlato") ||
        document.querySelector(".btn_agregar");

    // =====================
    // DATOS (Supabase)
    // =====================

    let platosRestaurante = [];
    let historialPedidos = [];

    async function cargarPlatos() {
        const { data, error } = await supabaseClient
            .from("platos")
            .select("*")
            .eq("restaurante_id", restauranteActual.id)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error al cargar platos:", error);
            platosRestaurante = [];
            return;
        }

        platosRestaurante = data || [];
    }

    async function cargarHistorialPedidos() {
        const { data, error } = await supabaseClient
            .from("transacciones")
            .select("items")
            .eq("restaurante_id", String(restauranteActual.id));

        if (error) {
            console.error("Error al cargar historial de pedidos:", error);
            historialPedidos = [];
            return;
        }

        historialPedidos = data || [];
    }

    async function cargar() {
        await cargarPlatos();
        await cargarHistorialPedidos();
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
        return String(texto || "")
            .trim()
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");
    }

    function obtenerEstado(plato) {
        return Number(plato.stock || 0) > 0 ? "Disponible" : "Agotado";
    }

    function obtenerClaseEstado(plato) {
        return Number(plato.stock || 0) > 0 ? "badge_con_stock" : "badge_sin_stock";
    }

    function contarPedidosDelPlato(plato) {
        let total = 0;

        historialPedidos.forEach((pedido) => {
            const items = Array.isArray(pedido.items) ? pedido.items : [];

            items.forEach((item) => {
                const mismoId =
                    item.platoId !== undefined &&
                    plato.id !== undefined &&
                    String(item.platoId) === String(plato.id);

                const mismoNombre =
                    normalizarTexto(item.nombre) === normalizarTexto(plato.nombre);

                if (mismoId || mismoNombre) {
                    total += Number(item.cantidad || 1);
                }
            });
        });

        return total;
    }

    // =====================
    // IMAGEN — comprimir y subir a Supabase Storage
    // =====================

    const BUCKET_IMAGENES = "imagenes_platos";

    function comprimirImagen(archivo) {
        return new Promise((resolve) => {
            const lector = new FileReader();

            lector.onload = function () {
                const imagen = new Image();

                imagen.onload = function () {
                    const ANCHO_MAXIMO = 800;

                    let ancho = imagen.width;
                    let alto = imagen.height;

                    if (ancho > ANCHO_MAXIMO) {
                        alto = Math.round((alto * ANCHO_MAXIMO) / ancho);
                        ancho = ANCHO_MAXIMO;
                    }

                    const canvas = document.createElement("canvas");
                    canvas.width = ancho;
                    canvas.height = alto;

                    const contexto = canvas.getContext("2d");
                    contexto.drawImage(imagen, 0, 0, ancho, alto);

                    canvas.toBlob(
                        (blob) => resolve(blob),
                        "image/jpeg",
                        0.7
                    );
                };

                imagen.src = lector.result;
            };

            lector.readAsDataURL(archivo);
        });
    }

    async function subirImagenPlato(input) {
        if (!input.files || input.files.length === 0) {
            return "";
        }

        const archivo = input.files[0];

        if (!archivo.type.startsWith("image/")) {
            alert("Selecciona una imagen válida.");
            return "";
        }

        const blobComprimido = await comprimirImagen(archivo);

        const nombreArchivo =
            `plato_${Date.now()}_${Math.floor(Math.random() * 10000)}.jpg`;

        const { error: errorSubida } = await supabaseClient
            .storage
            .from(BUCKET_IMAGENES)
            .upload(nombreArchivo, blobComprimido, {
                contentType: "image/jpeg",
                upsert: false
            });

        if (errorSubida) {
            console.error("Error al subir imagen:", errorSubida);
            alert("No se pudo subir la imagen del plato.");
            return "";
        }

        const { data: urlPublica } =
            supabaseClient.storage.from(BUCKET_IMAGENES).getPublicUrl(nombreArchivo);

        return urlPublica.publicUrl;
    }

    // =====================
    // RENDER
    // =====================

    function render() {
        tbody.innerHTML = "";

        if (platosRestaurante.length === 0) {
            tbody.innerHTML = `
                <tr class="tabla_fila">
                    <td class="tabla_td" colspan="6">
                        Todavía no tienes platos registrados.
                        <br>
                        Usa el botón “Agregar plato” para crear tu carta.
                    </td>
                </tr>
            `;
            return;
        }

        platosRestaurante.forEach((plato) => {
            const fila = document.createElement("tr");
            fila.classList.add("tabla_fila");

            fila.innerHTML = `
                <td class="tabla_td">
                    ${escaparHTML(plato.nombre)}
                    <br>
                    <small style="color:#6B7280;">
                        ${escaparHTML(plato.categoria || "Carta")}
                    </small>
                </td>
                <td class="tabla_td">
                    S/ ${Number(plato.precio || 0).toFixed(2)}
                </td>
                <td class="tabla_td">
                    ${Number(plato.stock || 0)}
                </td>
                <td class="tabla_td">
                    <span class="${obtenerClaseEstado(plato)}">
                        ${obtenerEstado(plato)}
                    </span>
                </td>
                <td class="tabla_td">
                    ${contarPedidosDelPlato(plato)}
                </td>
                <td class="tabla_td tabla_acciones">
                    <button type="button" class="btn_editar" data-id="${escaparHTML(plato.id)}">
                        ✏ Editar
                    </button>
                    <button type="button" class="btn_eliminar" data-id="${escaparHTML(plato.id)}">
                        🗑
                    </button>
                </td>
            `;

            tbody.appendChild(fila);
        });

        eventos();
    }

    // =====================
    // MODAL (crear / editar)
    // =====================

    function modal(plato = null) {
        const overlay = document.createElement("div");
        overlay.className = "modal_bg";

        overlay.innerHTML = `
            <div class="modal_box">
                <h3>${plato ? "Editar plato" : "Agregar plato"}</h3>

                <label style="font-size: 13px; font-weight: 600;">Nombre del plato</label>
                <input id="m_nombre" placeholder="Nombre del plato"
                    value="${plato ? escaparHTML(plato.nombre) : ""}">

                <label style="font-size: 13px; font-weight: 600; margin-top: 8px;">Descripción</label>
                <textarea id="m_descripcion" placeholder="Descripción del plato">${plato ? escaparHTML(plato.descripcion || "") : ""}</textarea>

                <label style="font-size: 13px; font-weight: 600; margin-top: 8px;">Categoría</label>
                <select id="m_categoria">
                    <option value="Más pedidos">Más pedidos</option>
                    <option value="Ceviches y tiraditos">Ceviches y tiraditos</option>
                    <option value="Platos de fondo">Platos de fondo</option>
                    <option value="Bebidas">Bebidas</option>
                    <option value="Postres">Postres</option>
                    <option value="Carta">Carta</option>
                </select>

                <label style="font-size: 13px; font-weight: 600; margin-top: 8px;">Precio</label>
                <input id="m_precio" type="number" min="0" step="0.10" placeholder="Precio"
                    value="${plato ? plato.precio : ""}">

                <label style="font-size: 13px; font-weight: 600; margin-top: 8px;">Stock</label>
                <input id="m_stock" type="number" min="0" placeholder="Stock"
                    value="${plato ? plato.stock : ""}">

                <label style="font-size: 13px; font-weight: 600; margin-top: 8px;">Imagen del plato</label>
                <input id="m_imagen" type="file" accept="image/*">

                ${
                    plato && plato.imagen_url
                        ? `<p style="font-size: 12px; color:#6B7280;">Si no seleccionas una imagen nueva, se conservará la actual.</p>`
                        : ""
                }

                <div class="modal_actions">
                    <button id="m_cancelar" type="button">Cancelar</button>
                    <button id="m_guardar" type="button">Guardar</button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        const selectCategoria = document.getElementById("m_categoria");
        if (plato && plato.categoria) {
            selectCategoria.value = plato.categoria;
        }

        document.getElementById("m_cancelar").onclick = function () {
            overlay.remove();
        };

        document.getElementById("m_guardar").onclick = async function () {
            const nombre = document.getElementById("m_nombre").value.trim();
            const descripcion = document.getElementById("m_descripcion").value.trim();
            const categoria = document.getElementById("m_categoria").value;
            const precio = parseFloat(document.getElementById("m_precio").value);
            const stock = parseInt(document.getElementById("m_stock").value);
            const inputImagen = document.getElementById("m_imagen");

            if (!nombre || !descripcion || isNaN(precio) || precio < 0 || isNaN(stock) || stock < 0) {
                alert("Completa nombre, descripción, precio y stock con valores válidos.");
                return;
            }

            const btnGuardar = document.getElementById("m_guardar");
            btnGuardar.disabled = true;
            btnGuardar.textContent = "Guardando...";

            const urlImagen = await subirImagenPlato(inputImagen);

            if (plato) {
                const cambios = {
                    nombre: nombre,
                    descripcion: descripcion,
                    categoria: categoria,
                    precio: precio,
                    stock: stock
                };

                if (urlImagen) {
                    cambios.imagen_url = urlImagen;
                }

                const { error } = await supabaseClient
                    .from("platos")
                    .update(cambios)
                    .eq("id", plato.id);

                if (error) {
                    console.error("Error al actualizar plato:", error);
                    alert("No se pudo actualizar el plato.");
                    btnGuardar.disabled = false;
                    btnGuardar.textContent = "Guardar";
                    return;
                }
            } else {
                const nuevoPlato = {
                    restaurante_id: restauranteActual.id,
                    nombre: nombre,
                    descripcion: descripcion,
                    categoria: categoria,
                    precio: precio,
                    stock: stock,
                    imagen_url: urlImagen || "../../../Assests/Img/Ceviche clasico.jpg"
                };

                const { error } = await supabaseClient
                    .from("platos")
                    .insert([nuevoPlato]);

                if (error) {
                    console.error("Error al crear plato:", error);
                    alert("No se pudo guardar el plato.");
                    btnGuardar.disabled = false;
                    btnGuardar.textContent = "Guardar";
                    return;
                }
            }

            overlay.remove();
            await cargar();
            render();
        };
    }

    // =====================
    // EVENTOS CRUD
    // =====================

    function eventos() {
        document.querySelectorAll(".btn_eliminar").forEach((btn) => {
            btn.onclick = async function () {
                const id = btn.dataset.id;
                const plato = platosRestaurante.find((item) => String(item.id) === String(id));

                if (!plato) return;

                const confirmar = confirm(`¿Deseas eliminar el plato "${plato.nombre}"?`);
                if (!confirmar) return;

                const { error } = await supabaseClient
                    .from("platos")
                    .delete()
                    .eq("id", plato.id);

                if (error) {
                    console.error("Error al eliminar plato:", error);
                    alert("No se pudo eliminar el plato.");
                    return;
                }

                await cargar();
                render();
            };
        });

        document.querySelectorAll(".btn_editar").forEach((btn) => {
            btn.onclick = function () {
                const id = btn.dataset.id;
                const plato = platosRestaurante.find((item) => String(item.id) === String(id));
                modal(plato);
            };
        });
    }

    if (btnAgregar) {
        btnAgregar.onclick = function () {
            modal();
        };
    }

    // =====================
    // NAVEGACIÓN SUPERIOR PANEL RESTAURANTE
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
                alert("Puedes gestionar tus platos, stock, inventario, pedidos, estadísticas y configuración desde el menú lateral.");
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
    }

    // =====================
    // INIT
    // =====================

    await cargar();
    render();
    configurarNavegacionPanel();

    // Menú hamburguesa (sidebar móvil)
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

});