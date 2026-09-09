// ==========================================
// paso1.js
// Carrito - Checkout paso 1
// Conserva restauranteId, ownerEmail y restauranteNombre
// Navegación completa
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    const accesoPermitido =
        protegerCheckout();

    if (!accesoPermitido) {
        return;
    }

    renderizarCarritoPaso1();
    configurarNavegacionPaso1();

});


// =====================
// VALIDACIÓN DE SESIÓN CHECKOUT
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

function protegerCheckout() {
    const usuarioActivo =
        obtenerUsuarioActivo();

    if (!usuarioActivo) {
        alert("Debes iniciar sesión para realizar un pedido.");

        window.location.href =
            "../../Gestion de pedido/Pages/cuenta-cliente.html";

        return false;
    }

    if (usuarioActivo.rol !== "cliente") {
        alert("El checkout está disponible solo para consumidores.");

        window.location.href =
            "../../Gestion operativa de la cocina/pages/pedidos_entrantes.html";

        return false;
    }

    return true;
}


// =====================
// LOCALSTORAGE
// =====================

function obtenerCarrito() {
    try {
        return JSON.parse(
            localStorage.getItem("foodfinder_cart")
        ) || [];
    } catch (error) {
        return [];
    }
}

function guardarCarrito(carrito) {
    localStorage.setItem(
        "foodfinder_cart",
        JSON.stringify(carrito)
    );
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

function obtenerNombreRestaurante(producto) {
    return (
        producto.restauranteNombre ||
        "Restaurante FoodFinder"
    );
}


// =====================
// RENDER CARRITO
// =====================

function renderizarCarritoPaso1() {
    const carrito =
        obtenerCarrito();

    const contenedor =
        document.querySelector(".cart-items");

    if (!contenedor) {
        console.warn("No se encontró el contenedor .cart-items");
        return;
    }

    if (carrito.length === 0) {
        contenedor.innerHTML = `
            <p style="text-align:center; padding: 20px;">
                Tu carrito está vacío 🛒
            </p>
        `;

        actualizarTotales(0);
        return;
    }

    contenedor.innerHTML = "";

    let subtotal = 0;

    carrito.forEach((producto, index) => {
        const precio =
            Number(producto.precio) || 0;

        const cantidad =
            Number(producto.cantidad) || 1;

        const totalProducto =
            precio * cantidad;

        subtotal += totalProducto;

        const imagen =
            producto.imagen || "";

        const restauranteNombre =
            obtenerNombreRestaurante(producto);

        const itemHTML = `
            <div class="cart-item">
                <div
                    class="item-img"
                    style="background-image: url('${escaparHTML(imagen)}');">
                </div>

                <div class="item-details">
                    <h4>${escaparHTML(producto.nombre)}</h4>

                    <p style="margin: 4px 0; color: #7A8793; font-size: 13px;">
                        ${escaparHTML(restauranteNombre)}
                    </p>

                    <span class="price">
                        S/ ${precio.toFixed(2)}
                    </span>

                    <div class="quantity-control">
                        <button
                            type="button"
                            class="btn-qty"
                            onclick="modificarCantidad(${index}, -1)">
                            −
                        </button>

                        <span class="qty-number">
                            ${cantidad}
                        </span>

                        <button
                            type="button"
                            class="btn-qty"
                            onclick="modificarCantidad(${index}, 1)">
                            +
                        </button>
                    </div>
                </div>
            </div>
        `;

        contenedor.insertAdjacentHTML(
            "beforeend",
            itemHTML
        );
    });

    actualizarTotales(subtotal);
}


// =====================
// MODIFICAR CANTIDAD
// =====================

window.modificarCantidad = function (index, cambio) {
    const carrito =
        obtenerCarrito();

    if (!carrito[index]) {
        return;
    }

    carrito[index].cantidad =
        Number(carrito[index].cantidad || 1) + cambio;

    if (carrito[index].cantidad <= 0) {
        carrito.splice(index, 1);
    }

    guardarCarrito(carrito);
    renderizarCarritoPaso1();
};


// =====================
// TOTALES
// =====================

function actualizarTotales(subtotal) {
    const delivery =
        subtotal > 0 ? 3.50 : 0;

    const total =
        subtotal + delivery;

    const filasTotales =
        document.querySelectorAll(".total-row");

    if (filasTotales.length >= 3) {
        filasTotales[0]
            .querySelectorAll("span")[1]
            .innerText =
            `S/ ${subtotal.toFixed(2)}`;

        filasTotales[1]
            .querySelectorAll("span")[1]
            .innerText =
            `S/ ${delivery.toFixed(2)}`;

        filasTotales[2]
            .querySelectorAll("span")[1]
            .innerText =
            `S/ ${total.toFixed(2)}`;
    }
}


// =====================
// NAVEGACIÓN PASO 1
// =====================

function configurarNavegacionPaso1() {
    const btnVolverHome =
        document.getElementById("btnVolverHome");

    const btnContinuarPago =
        document.getElementById("btnContinuarPago");

    const btnIrCheckout =
        document.getElementById("btnIrCheckout");

    const buscadorCheckout =
        document.getElementById("buscadorCheckout");

    if (btnVolverHome) {
        btnVolverHome.addEventListener("click", () => {
            window.location.href =
                "../../Navegación/pages/home.html";
        });
    }

    if (btnContinuarPago) {
        btnContinuarPago.addEventListener("click", (e) => {
            e.preventDefault();
            validarYContinuarPago();
        });
    }

    if (btnIrCheckout) {
        btnIrCheckout.addEventListener("click", (e) => {
            e.preventDefault();
            validarYContinuarPago();
        });
    }

    if (buscadorCheckout) {
        buscadorCheckout.addEventListener("click", () => {
            alert("Para buscar más restaurantes o platos, vuelve al Home.");
        });
    }
}

function validarYContinuarPago() {
    const carrito =
        obtenerCarrito();

    if (carrito.length === 0) {
        alert("Tu carrito está vacío. Agrega un producto antes de continuar.");
        return;
    }

    window.location.href =
        "Carrito_compras2.html";
}