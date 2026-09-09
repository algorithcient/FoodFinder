// ==========================================
// catalogo.js
// Home FoodFinder — Supabase
// ==========================================

const SUPABASE_URL = "https://emqlgfmibvxdyipxubul.supabase.co";
const SUPABASE_KEY = "sb_publishable_sdiAONM5AeOf56mRe78fiw_YkP3uN46";
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let restaurantesCache = [];
let platosCache = [];
let resenasCache = [];

// =====================
// VALIDACIÓN DE SESIÓN
// =====================

function obtenerUsuarioActivo() {
    try {
        return JSON.parse(localStorage.getItem("usuarioActivo"));
    } catch (error) {
        return null;
    }
}

function protegerPaginaConsumidor() {
    const usuarioActivo = obtenerUsuarioActivo();

    if (!usuarioActivo) {
        alert("Debes iniciar sesión para acceder a FoodFinder.");
        window.location.href = "../../Gestion de pedido/Pages/cuenta-cliente.html";
        return false;
    }

    if (usuarioActivo.rol !== "cliente") {
        alert("Esta sección es solo para consumidores.");
        window.location.href = "../../Gestion operativa de la cocina/pages/pedidos_entrantes.html";
        return false;
    }

    return true;
}

// =====================
// CARRITO (sigue en localStorage, es solo la sesión de compra)
// =====================

function obtenerDatos(key) {
    try {
        return JSON.parse(localStorage.getItem(key)) || [];
    } catch (error) {
        return [];
    }
}

function guardarDatos(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

function obtenerCarrito() {
    return obtenerDatos("foodfinder_cart");
}

function guardarCarrito(carrito) {
    guardarDatos("foodfinder_cart", carrito);
}

// =====================
// DATOS SUPABASE (restaurantes, platos, resenas)
// =====================

function obtenerRestaurantesRegistrados() {
    return restaurantesCache;
}

function obtenerPlatosRegistrados() {
    return platosCache;
}

function obtenerResenasRegistradas() {
    return resenasCache;
}

async function cargarDatosDesdeSupabase() {
    const [restaurantesResp, platosResp, resenasResp] = await Promise.all([
        supabaseClient.from("restaurantes").select("*, usuarios(correo)"),
        supabaseClient.from("platos").select("*"),
        supabaseClient.from("resenas").select("*")
    ]);

    if (restaurantesResp.error) {
        console.error("Error al cargar restaurantes:", restaurantesResp.error);
    }

    if (platosResp.error) {
        console.error("Error al cargar platos:", platosResp.error);
    }

    if (resenasResp.error) {
        console.error("Error al cargar reseñas:", resenasResp.error);
    }

    restaurantesCache = (restaurantesResp.data || []).map((restaurante) => {
        return {
            ...restaurante,
            ownerEmail: restaurante.usuarios ? restaurante.usuarios.correo : ""
        };
    });

    platosCache = platosResp.data || [];
    resenasCache = resenasResp.data || [];
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

function obtenerTextoCategoria(categoriaElemento) {
    const label = categoriaElemento.querySelector(".cat-label");

    if (label) {
        return normalizarTexto(label.textContent);
    }

    return normalizarTexto(categoriaElemento.textContent);
}

function calcularPromedioResenas(resenas, ratingBase) {
    if (resenas.length === 0) {
        return Number(ratingBase || 4.8);
    }

    const total = resenas.reduce((suma, resena) => {
        return suma + Number(resena.calificacion || 0);
    }, 0);

    return total / resenas.length;
}

function obtenerResenasDelRestaurante(restaurante) {
    if (!restaurante) {
        return [];
    }

    return obtenerResenasRegistradas().filter((resena) => {
        return String(resena.restaurante_id) === String(restaurante.id);
    });
}

function obtenerRatingRestaurante(restaurante) {
    const resenas = obtenerResenasDelRestaurante(restaurante);
    const promedio = calcularPromedioResenas(resenas, restaurante.rating);
    return promedio.toFixed(1);
}

function obtenerCantidadResenasRestaurante(restaurante) {
    const resenas = obtenerResenasDelRestaurante(restaurante);

    if (resenas.length > 0) {
        return resenas.length;
    }

    return Number(restaurante.reviews || 0);
}

// =====================
// CARRITO
// =====================

function buscarRestaurantePorNombre(nombreRestaurante) {
    const nombreNormalizado = normalizarTexto(nombreRestaurante);

    const restaurante = obtenerRestaurantesRegistrados().find((item) => {
        return normalizarTexto(item.nombre) === nombreNormalizado;
    });

    if (restaurante) {
        return {
            id: restaurante.id,
            ownerEmail: restaurante.ownerEmail || "",
            restauranteNombre: restaurante.nombre
        };
    }

    return {
        id: "",
        ownerEmail: "",
        restauranteNombre: nombreRestaurante || "FoodFinder"
    };
}

function agregarAlCarrito(productoNuevo) {
    const carrito = obtenerCarrito();

    const index = carrito.findIndex((producto) => {
        return (
            producto.nombre === productoNuevo.nombre &&
            producto.restauranteId === productoNuevo.restauranteId
        );
    });

    if (index !== -1) {
        carrito[index].cantidad = Number(carrito[index].cantidad || 1) + 1;
    } else {
        carrito.push(productoNuevo);
    }

    guardarCarrito(carrito);
}

function obtenerProductoDesdeTarjeta(boton) {
    const tarjeta = boton.closest(".plate-card");

    if (!tarjeta) {
        return null;
    }

    const nombreElemento = tarjeta.querySelector("h4");
    const precioElemento = tarjeta.querySelector(".price");
    const restauranteElemento = tarjeta.querySelector(".plate-resto");

    if (!nombreElemento || !precioElemento) {
        return null;
    }

    const nombre = nombreElemento.textContent.trim();
    const precio = parseFloat(precioElemento.textContent.replace(/[^0-9.]/g, ""));
    const imgElement = tarjeta.querySelector("img");
    const imagen = imgElement ? imgElement.src : "";

    const nombreRestaurante = restauranteElemento
        ? restauranteElemento.textContent.trim()
        : "FoodFinder";

    const restaurante = buscarRestaurantePorNombre(nombreRestaurante);

    const plato = obtenerPlatosRegistrados().find((item) => {
        return (
            normalizarTexto(item.nombre) === normalizarTexto(nombre) &&
            String(item.restaurante_id) === String(restaurante.id)
        );
    });

    return {
        platoId: plato ? plato.id : "",
        nombre,
        precio,
        imagen,
        cantidad: 1,
        restauranteId: restaurante.id,
        ownerEmail: restaurante.ownerEmail,
        restauranteNombre: restaurante.restauranteNombre
    };
}

function configurarBotonesAgregar() {
    const botonesAgregar = document.querySelectorAll(".btn-add");

    botonesAgregar.forEach((boton) => {
        if (boton.dataset.configurado === "true") {
            return;
        }

        boton.dataset.configurado = "true";

        boton.addEventListener("click", () => {
            if (boton.disabled || boton.classList.contains("disabled")) {
                return;
            }

            const producto = obtenerProductoDesdeTarjeta(boton);

            if (!producto) {
                return;
            }

            agregarAlCarrito(producto);

            const textoOriginal = boton.textContent;
            boton.textContent = "✓";
            boton.style.backgroundColor = "#4CAF50";

            setTimeout(() => {
                boton.textContent = textoOriginal;
                boton.style.backgroundColor = "";
            }, 1000);
        });
    });
}

// =====================
// NAVEGACIÓN HOME
// =====================

function configurarLogoHome() {
    const logo = document.querySelector(".logo-completo-consumidor");

    if (!logo) {
        return;
    }

    logo.style.cursor = "pointer";

    logo.addEventListener("click", () => {
        window.location.href = "home.html";
    });
}

function configurarBotonesVerCarta() {
    const grid = document.querySelector(".restaurant-grid");

    if (!grid) {
        return;
    }

    if (grid.dataset.listenerVerCarta === "true") {
        return;
    }

    grid.dataset.listenerVerCarta = "true";

    grid.addEventListener("click", (e) => {
        const boton = e.target.closest(".btn-ver-carta");

        if (!boton) {
            return;
        }

        const card = boton.closest(".resto-card");
        const restauranteId = card ? card.dataset.restauranteId : "";

        if (!restauranteId) {
            alert("No se encontró el restaurante seleccionado.");
            return;
        }

        window.location.href = "restaurantes.html?id=" + encodeURIComponent(restauranteId);
    });
}

function configurarBotonFiltros() {
    const botonFiltros = document.querySelector(".btn-filter");

    if (!botonFiltros) {
        return;
    }

    botonFiltros.addEventListener("click", () => {
        alert("Los filtros avanzados por precio, distrito y promociones estarán disponibles en la versión final.");
    });
}

function configurarPerfilHome() {
    const iconoPerfil =
        document.getElementById("btn-perfil") ||
        document.querySelector('img[alt="Perfil"]');

    if (!iconoPerfil) {
        return;
    }

    if (iconoPerfil.closest("a")) {
        return;
    }

    iconoPerfil.style.cursor = "pointer";

    iconoPerfil.addEventListener("click", () => {
        window.location.href = "../../Gestion de pedido/Pages/cuenta-cliente.html";
    });
}

// =====================
// VISIBILIDAD HOME
// =====================

let mostrarTodosRestaurantes = false;
let textoBusquedaHome = "";
let categoriaActivaHome = "todo";

function cardCoincideConBusqueda(card) {
    if (!textoBusquedaHome) {
        return true;
    }

    return normalizarTexto(card.textContent).includes(textoBusquedaHome);
}

function cardCoincideConCategoria(card) {
    if (!categoriaActivaHome || categoriaActivaHome.includes("todo")) {
        return true;
    }

    return normalizarTexto(card.textContent).includes(categoriaActivaHome);
}

function actualizarBotonVerMas(totalRestaurantesVisibles) {
    const btnVerMas = document.getElementById("btn-ver-mas-restaurantes");

    if (!btnVerMas) {
        return;
    }

    if (totalRestaurantesVisibles <= 3) {
        btnVerMas.style.display = "none";
        return;
    }

    btnVerMas.style.display = "";
    btnVerMas.textContent = mostrarTodosRestaurantes ? "Ver menos ↑" : "Ver más →";
}

function actualizarVisibilidadHome() {
    const restaurantes = document.querySelectorAll(".restaurant-grid .resto-card");
    const platos = document.querySelectorAll(".plates-grid .plate-card");
    const restaurantesCoincidentes = [];

    restaurantes.forEach((card) => {
        const visible = cardCoincideConBusqueda(card) && cardCoincideConCategoria(card);

        if (visible) {
            restaurantesCoincidentes.push(card);
        }

        card.style.display = "none";
    });

    restaurantesCoincidentes.forEach((card, index) => {
        if (!mostrarTodosRestaurantes && index >= 3) {
            card.style.display = "none";
        } else {
            card.style.display = "";
        }
    });

    platos.forEach((card) => {
        const visible = cardCoincideConBusqueda(card) && cardCoincideConCategoria(card);
        card.style.display = visible ? "" : "none";
    });

    actualizarBotonVerMas(restaurantesCoincidentes.length);
}

function configurarBuscadorHome() {
    const buscador = document.querySelector(".search-bar");

    if (!buscador) {
        return;
    }

    buscador.addEventListener("input", () => {
        textoBusquedaHome = normalizarTexto(buscador.value);
        actualizarVisibilidadHome();
    });
}

function configurarCategoriasHome() {
    const categorias = document.querySelectorAll(".cat-pill");

    categorias.forEach((categoria) => {
        categoria.addEventListener("click", () => {
            categorias.forEach((item) => {
                item.classList.remove("active");
            });

            categoria.classList.add("active");
            categoriaActivaHome = obtenerTextoCategoria(categoria);
            actualizarVisibilidadHome();
        });
    });
}

function configurarBotonVerMasRestaurantes() {
    const btnVerMas = document.getElementById("btn-ver-mas-restaurantes");

    if (!btnVerMas) {
        return;
    }

    btnVerMas.addEventListener("click", () => {
        mostrarTodosRestaurantes = !mostrarTodosRestaurantes;
        actualizarVisibilidadHome();
    });
}

// =====================
// RESTAURANTES DINÁMICOS
// =====================

function crearCardRestaurante(restaurante) {
    const imagen = restaurante.imagen_url || "../../../Assests/Img/El rincon del sabor.jpg";
    const nombre = restaurante.nombre || "Restaurante FoodFinder";
    const cocina = restaurante.cocina || "Emprendimiento gastronómico";
    const direccion = restaurante.direccion || restaurante.distrito || "Lima, Perú";
    const descripcion = restaurante.descripcion || "Restaurante registrado en FoodFinder.";
    const horario = restaurante.horario || "Horario no registrado";
    const telefono = restaurante.telefono || "Teléfono no registrado";
    const rating = obtenerRatingRestaurante(restaurante);
    const reviews = obtenerCantidadResenasRestaurante(restaurante);

    const article = document.createElement("article");
    article.classList.add("resto-card");
    article.dataset.restauranteId = restaurante.id;
    article.dataset.dinamico = "true";

    article.innerHTML = `
        <div class="resto-img-wrapper">
            <img src="${escaparHTML(imagen)}" alt="${escaparHTML(nombre)}">
            <span class="badge-open">
                <span class="dot"></span>
                ${escaparHTML(restaurante.estado || "Abierto")}
            </span>
        </div>

        <div class="resto-info">
            <h3>${escaparHTML(nombre)}</h3>
            <p class="cuisine">${escaparHTML(cocina)}</p>

            <div class="resto-meta">
                <span class="star">★ ${escaparHTML(rating)}</span>
                <span class="reviews">(${escaparHTML(reviews)})</span>
            </div>

            <div class="tags">
                <span class="tag">${escaparHTML(direccion)}</span>
                <span class="tag">${escaparHTML(horario)}</span>
                <span class="tag">${escaparHTML(telefono)}</span>
            </div>

            <p class="restaurant-description">${escaparHTML(descripcion)}</p>
        </div>

        <div class="resto-footer" style="justify-content: flex-end;">
            <button type="button" class="btn-ver-carta">Ver carta →</button>
        </div>
    `;

    return article;
}

function limpiarCardsRestaurantes() {
    const grid = document.querySelector(".restaurant-grid");

    if (!grid) {
        return;
    }

    grid.innerHTML = "";
}

function cargarRestaurantesDinamicosEnHome() {
    const grid = document.querySelector(".restaurant-grid");

    if (!grid) {
        return;
    }

    limpiarCardsRestaurantes();

    const restaurantes = obtenerRestaurantesRegistrados();

    if (restaurantes.length === 0) {
        grid.innerHTML = `
            <p style="padding: 24px; color:#6B7280;">
                Todavía no hay restaurantes registrados en FoodFinder.
            </p>
        `;
        return;
    }

    restaurantes.forEach((restaurante) => {
        const card = crearCardRestaurante(restaurante);
        grid.appendChild(card);
    });

    actualizarVisibilidadHome();
}

// =====================
// INICIALIZACIÓN
// =====================

document.addEventListener("DOMContentLoaded", async () => {
    const accesoPermitido = protegerPaginaConsumidor();

    if (!accesoPermitido) {
        return;
    }

    await cargarDatosDesdeSupabase();

    configurarLogoHome();
    configurarBotonFiltros();
    configurarBuscadorHome();
    configurarCategoriasHome();
    configurarBotonesAgregar();
    configurarPerfilHome();
    configurarBotonVerMasRestaurantes();
    configurarBotonesVerCarta();

    cargarRestaurantesDinamicosEnHome();
    actualizarVisibilidadHome();
});