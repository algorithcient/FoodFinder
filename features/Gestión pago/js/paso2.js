document.addEventListener("DOMContentLoaded", () => {

    const accesoPermitido =
        protegerCheckout();

    if (!accesoPermitido) {
        return;
    }

    renderizarResumenPedido();
    configurarMetodosPago();
    configurarNavegacionPago();
    configurarCamposTarjeta();
});


// =====================
// SESIÓN CHECKOUT
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

function obtenerCarrito() {
    return obtenerDatos("foodfinder_cart");
}

function obtenerPedidosActivos() {
    return obtenerDatos("pedidosActivos");
}

function guardarPedidosActivos(pedidos) {
    guardarDatos(
        "pedidosActivos",
        pedidos
    );
}

function obtenerPlatosRegistrados() {
    return obtenerDatos("platos_data");
}

function guardarPlatosRegistrados(platos) {
    guardarDatos(
        "platos_data",
        platos
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

function normalizarTexto(texto) {
    return String(texto || "")
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}

function obtenerMetodoPagoSeleccionado() {
    const radio =
        document.querySelector('input[name="payment"]:checked');

    if (!radio) {
        return "card";
    }

    return radio.value;
}

function obtenerNombreMetodoPago(valor) {
    const metodos = {
        card: "Tarjeta de crédito/débito",
        cash: "Efectivo al delivery",
        yape: "Yape / Plin",
        transfer: "Transferencia"
    };

    return metodos[valor] || "Método de pago";
}


// =====================
// RESUMEN DE PEDIDO
// =====================

function renderizarResumenPedido() {
    const carrito =
        obtenerCarrito();

    const contenedor =
        document.getElementById("order-items") ||
        document.querySelector(".order-items");

    if (!contenedor) {
        console.warn("No se encontró el contenedor del resumen del pedido.");
        return;
    }

    contenedor.innerHTML = "";

    if (carrito.length === 0) {
        contenedor.innerHTML = `
            <p style="padding: 15px;">
                No hay productos en el carrito.
            </p>
        `;

        actualizarTotales(0);
        return;
    }

    let subtotal = 0;

    carrito.forEach((producto) => {
        const cantidad =
            Number(producto.cantidad) || 1;

        const precio =
            Number(producto.precio) || 0;

        const totalProducto =
            precio * cantidad;

        subtotal += totalProducto;

        const restauranteNombre =
            producto.restauranteNombre ||
            "FoodFinder";

        const itemHTML = `
            <div class="order-item">
                <span>
                    ${cantidad}x ${escaparHTML(producto.nombre)}

                    <small style="display:block; color:#7A8793;">
                        ${escaparHTML(restauranteNombre)}
                    </small>
                </span>

                <span class="price">
                    S/ ${totalProducto.toFixed(2)}
                </span>
            </div>
        `;

        contenedor.insertAdjacentHTML(
            "beforeend",
            itemHTML
        );
    });

    actualizarTotales(subtotal);
}

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
            .textContent =
            `S/ ${subtotal.toFixed(2)}`;

        filasTotales[1]
            .querySelectorAll("span")[1]
            .textContent =
            `S/ ${delivery.toFixed(2)}`;

        filasTotales[2]
            .querySelectorAll("span")[1]
            .textContent =
            `S/ ${total.toFixed(2)}`;
    }
}


// =====================
// MÉTODOS DE PAGO
// =====================

function configurarMetodosPago() {
    const opciones =
        document.querySelectorAll(".payment-option");

    const camposTarjeta =
        document.getElementById("camposTarjeta");

    const mensajeMetodoPago =
        document.getElementById("mensajeMetodoPago");

    opciones.forEach((opcion) => {
        opcion.addEventListener("click", () => {
            opciones.forEach((item) => {
                item.classList.remove("selected");
            });

            opcion.classList.add("selected");

            const radio =
                opcion.querySelector('input[name="payment"]');

            if (!radio) {
                return;
            }

            radio.checked =
                true;

            if (radio.value === "card") {
                if (camposTarjeta) {
                    camposTarjeta.style.display =
                        "";
                }

                if (mensajeMetodoPago) {
                    mensajeMetodoPago.style.display =
                        "none";
                }

                return;
            }

            if (camposTarjeta) {
                camposTarjeta.style.display =
                    "none";
            }

            if (mensajeMetodoPago) {
                mensajeMetodoPago.style.display =
                    "";
            }
        });
    });
}


// =====================
// NAVEGACIÓN PAGO
// =====================

function configurarNavegacionPago() {
    const btnVolver =
        document.getElementById("btnVolverCarrito") ||
        document.querySelector(".btn-secondary");

    const btnConfirmar =
        document.getElementById("btn-confirmar-pedido") ||
        buscarBotonPorTexto("Confirmar");

    const buscadorCheckoutPago =
        document.getElementById("buscadorCheckoutPago");

    if (btnVolver) {
        btnVolver.addEventListener("click", () => {
            window.location.href =
                "Carrito_compras1.html";
        });
    }

    if (btnConfirmar) {
        btnConfirmar.addEventListener("click", (e) => {
            e.preventDefault();
            confirmarPedido(btnConfirmar);
        });
    }

    if (buscadorCheckoutPago) {
        buscadorCheckoutPago.addEventListener("click", () => {
            alert("Para buscar más restaurantes o platos, vuelve al Home.");
        });
    }
}


// =====================
// AGRUPAR POR RESTAURANTE
// =====================

function agruparCarritoPorRestaurante(carrito) {
    const grupos = {};

    carrito.forEach((producto) => {
        const restauranteId =
            producto.restauranteId ||
            "rest_static_rincon";

        const ownerEmail =
            producto.ownerEmail ||
            "static@foodfinder.local";

        const restauranteNombre =
            producto.restauranteNombre ||
            "El Rincón del Sabor";

        const clave =
            restauranteId + "|" + ownerEmail;

        if (!grupos[clave]) {
            grupos[clave] = {
                restauranteId,
                ownerEmail,
                restauranteNombre,
                items: []
            };
        }

        grupos[clave].items.push(producto);
    });

    return Object.values(grupos);
}

function calcularSubtotalGrupo(items) {
    return items.reduce((total, producto) => {
        const precio =
            Number(producto.precio) || 0;

        const cantidad =
            Number(producto.cantidad) || 1;

        return total + precio * cantidad;
    }, 0);
}

function calcularCantidadGrupo(items) {
    return items.reduce((total, producto) => {
        const cantidad =
            Number(producto.cantidad) || 1;

        return total + cantidad;
    }, 0);
}

function crearPedidoDesdeGrupo(grupo, indice) {
    const usuarioActivo =
        obtenerUsuarioActivo();

    const subtotal =
        calcularSubtotalGrupo(grupo.items);

    const cantidadTotal =
        calcularCantidadGrupo(grupo.items);

    const metodoPago =
        obtenerMetodoPagoSeleccionado();

    // En la pantalla del checkout se muestra un delivery general de S/ 3.50.
    // Para evitar duplicar el delivery si hay más de un restaurante,
    // se asigna solo al primer pedido generado.
    const delivery =
        indice === 0 && subtotal > 0 ? 3.50 : 0;

    const total =
        subtotal + delivery;

    const nombresPlatos =
        grupo.items
            .map((producto) => {
                const cantidad =
                    Number(producto.cantidad) || 1;

                return `${cantidad}x ${producto.nombre}`;
            })
            .join(", ");

    const itemsPedido =
        grupo.items.map((producto) => {
            return {
                platoId: producto.platoId || "",
                nombre: producto.nombre,
                precio: Number(producto.precio) || 0,
                cantidad: Number(producto.cantidad) || 1,
                imagen: producto.imagen || ""
            };
        });

    return {
        id:
            "#" +
            Date.now()
                .toString()
                .slice(-4) +
            String(indice + 1),

        plato:
            nombresPlatos,

        cliente:
            usuarioActivo.nombre ||
            "Cliente Demo",

        clienteEmail:
            usuarioActivo.correo ||
            "",

        cantidad:
            cantidadTotal,

        estado:
            "confirmado",

        hora:
            new Date()
                .toLocaleTimeString(
                    "es-PE",
                    {
                        hour: "2-digit",
                        minute: "2-digit"
                    }
                ),

        subtotal:
            subtotal,

        delivery:
            delivery,

        total:
            total,

        // Por ahora inicia en 0.
        // Luego puede actualizarse desde Supabase o desde otro módulo.
        gastos:
            0,

        metodoPago:
            metodoPago,

        metodoPagoNombre:
            obtenerNombreMetodoPago(metodoPago),

        restauranteId:
            grupo.restauranteId,

        ownerEmail:
            grupo.ownerEmail,

        restauranteNombre:
            grupo.restauranteNombre,

        items:
            itemsPedido,

        fecha:
            new Date().toISOString()
    };
}


// =====================
// STOCK AUTOMÁTICO
// =====================

function buscarPlatoParaStock(platos, producto) {
    if (producto.platoId) {
        const porId =
            platos.find((plato) => {
                return String(plato.id) === String(producto.platoId);
            });

        if (porId) {
            return porId;
        }
    }

    return platos.find((plato) => {
        const mismoRestaurante =
            plato.restauranteId === producto.restauranteId ||
            plato.ownerEmail === producto.ownerEmail;

        const mismoNombre =
            normalizarTexto(plato.nombre) === normalizarTexto(producto.nombre);

        return mismoRestaurante && mismoNombre;
    });
}

function validarStockAntesDeConfirmar(carrito) {
    const platos =
        obtenerPlatosRegistrados();

    for (const producto of carrito) {
        const plato =
            buscarPlatoParaStock(platos, producto);

        if (!plato) {
            continue;
        }

        const cantidadComprada =
            Number(producto.cantidad) || 1;

        const stockActual =
            Number(plato.stock ?? plato.cantidad ?? 0);

        if (stockActual < cantidadComprada) {
            alert(
                `No hay stock suficiente para "${producto.nombre}". Stock disponible: ${stockActual}.`
            );

            return false;
        }
    }

    return true;
}

function actualizarStockPlatosDesdeCarrito(carrito) {
    const platos =
        obtenerPlatosRegistrados();

    if (platos.length === 0) {
        return;
    }

    let huboCambios =
        false;

    carrito.forEach((producto) => {
        const plato =
            buscarPlatoParaStock(platos, producto);

        if (!plato) {
            return;
        }

        const cantidadComprada =
            Number(producto.cantidad) || 1;

        const stockActual =
            Number(plato.stock ?? plato.cantidad ?? 0);

        const nuevoStock =
            Math.max(
                0,
                stockActual - cantidadComprada
            );

        plato.stock =
            nuevoStock;

        plato.disponible =
            nuevoStock > 0;

        if (nuevoStock <= 0) {
            plato.estado =
                "agotado";
        } else {
            plato.estado =
                "disponible";
        }

        huboCambios =
            true;
    });

    if (huboCambios) {
        guardarPlatosRegistrados(platos);
    }
}


// =====================
// CONFIRMAR PEDIDO
// =====================

async function confirmarPedido(btnConfirmar) {
    const carrito =
        obtenerCarrito();

    if (carrito.length === 0) {
        alert("No hay productos en el carrito.");
        return;
    }

    const stockValido =
        validarStockAntesDeConfirmar(carrito);

    if (!stockValido) {
        return;
    }

    btnConfirmar.disabled =
        true;

    btnConfirmar.textContent =
        "Procesando...";

    actualizarStockPlatosDesdeCarrito(carrito);

    const pedidosActivos =
        obtenerPedidosActivos();

    const gruposPorRestaurante =
        agruparCarritoPorRestaurante(carrito);

    const nuevosPedidos =
        gruposPorRestaurante.map((grupo, index) => {
            return crearPedidoDesdeGrupo(grupo, index);
        });

    nuevosPedidos.forEach((pedido) => {
        pedidosActivos.push(pedido);
    });

    // 1. Guarda el pedido en localStorage, como ya funcionaba antes.
    guardarPedidosActivos(pedidosActivos);

    // 2. Registra la venta en Supabase, en la tabla transacciones.
    let transaccionRegistrada =
        false;

    if (window.FoodFinderTransacciones) {
        const resultado =
            await window.FoodFinderTransacciones
                .registrarTransaccionesDesdePedidos(nuevosPedidos);

        transaccionRegistrada =
            resultado.ok;

        if (!resultado.ok) {
            console.warn(
                "El pedido se guardó localmente, pero no se registró en Supabase.",
                resultado.error
            );
        }
    } else {
        console.warn(
            "El módulo FoodFinderTransacciones no está cargado."
        );
    }

    // 3. Limpia el carrito.
    localStorage.removeItem("foodfinder_cart");

    if (transaccionRegistrada) {
        alert(
            "Pedido confirmado."
        );
    } else {
        alert(
            "Pedido confirmado. Sin embargo, la transacción no se pudo registrar en Supabase."
        );
    }

    window.location.href =
        "../../Navegación/pages/home.html";
}


// =====================
// UTILIDAD BOTONES
// =====================

function buscarBotonPorTexto(texto) {
    const botones =
        document.querySelectorAll("button");

    return Array
        .from(botones)
        .find((boton) => {
            return boton.textContent
                .toLowerCase()
                .includes(texto.toLowerCase());
        });
}
function configurarCamposTarjeta() {
    const numeroTarjeta =
        document.getElementById("numeroTarjeta");

    const vencimientoTarjeta =
        document.getElementById("vencimientoTarjeta");

    const cvvTarjeta =
        document.getElementById("cvvTarjeta");

    if (numeroTarjeta) {
        numeroTarjeta.addEventListener("input", () => {
            let valor = numeroTarjeta.value
                .replace(/\D/g, "")
                .slice(0, 16);

            numeroTarjeta.value = valor
                .replace(/(.{4})/g, "$1 ")
                .trim();
        });
    }

    if (vencimientoTarjeta) {
        vencimientoTarjeta.addEventListener("input", () => {
            let valor = vencimientoTarjeta.value
                .replace(/\D/g, "")
                .slice(0, 4);

            if (valor.length >= 3) {
                valor = valor.slice(0, 2) + "/" + valor.slice(2);
            }

            vencimientoTarjeta.value = valor;
        });
    }

    if (cvvTarjeta) {
        cvvTarjeta.addEventListener("input", () => {
            cvvTarjeta.value = cvvTarjeta.value
                .replace(/\D/g, "")
                .slice(0, 3);
        });
    }
}