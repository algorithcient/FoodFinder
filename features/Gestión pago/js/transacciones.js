// =====================================================
// MÓDULO DE TRANSACCIONES - SUPABASE
// Este archivo registra las ventas del carrito en Supabase
// Tabla usada: public.transacciones
// =====================================================

(function () {
    
    
    const SUPABASE_URL = "https://emqlgfmibvxdyipxubul.supabase.co";
    const SUPABASE_ANON_KEY = "sb_publishable_sdiAONM5AeOf56mRe78fiw_YkP3uN46";

    let supabaseTransacciones = null;

    // Verifica que la librería de Supabase esté cargada en el HTML
    if (window.supabase) {
        supabaseTransacciones = window.supabase.createClient(
            SUPABASE_URL,
            SUPABASE_ANON_KEY
        );
    } else {
        console.warn("No se encontró la librería de Supabase en esta página.");
    }

    // Convierte cualquier valor numérico a número con 2 decimales
    function redondear(valor) {
        return Number((Number(valor) || 0).toFixed(2));
    }

    // Calcula ganancias y pérdidas según total y gastos
    function calcularResultado(total, gastos) {
        const resultado = redondear(total - gastos);

        return {
            ganancias: resultado > 0 ? resultado : 0,
            perdidas: resultado < 0 ? Math.abs(resultado) : 0
        };
    }

    // Convierte un pedido del carrito en una fila para la tabla transacciones
    function prepararTransaccionDesdePedido(pedido) {
        const subtotal = redondear(pedido.subtotal);
        const delivery = redondear(pedido.delivery);
        const total = redondear(pedido.total || subtotal + delivery);

        // Por ahora los gastos empiezan en 0.
        // Luego pueden actualizarse manualmente o desde otro módulo.
        const gastos = redondear(pedido.gastos || 0);

        const resultado = calcularResultado(total, gastos);

        return {
            pedido_id: String(pedido.id),

            cliente_email: pedido.clienteEmail || "",
            cliente_nombre: pedido.cliente || "",

            restaurante_id: pedido.restauranteId || "",
            owner_email: pedido.ownerEmail || "",
            restaurante_nombre: pedido.restauranteNombre || "",

            metodo_pago: pedido.metodoPago || "",
            metodo_pago_nombre: pedido.metodoPagoNombre || "",

            cantidad_total: Number(pedido.cantidad) || 0,

            subtotal: subtotal,
            delivery: delivery,
            total: total,

            gastos: gastos,
            ganancias: resultado.ganancias,
            perdidas: resultado.perdidas,

            estado: pedido.estado || "confirmado",

            items: pedido.items || [],

            fecha: pedido.fecha || new Date().toISOString()
        };
    }

    // Registra una o varias transacciones en Supabase
    async function registrarTransaccionesDesdePedidos(pedidos) {
        if (!supabaseTransacciones) {
            console.warn("No se pudo registrar porque Supabase no está inicializado.");

            return {
                ok: false,
                error: "Supabase no está inicializado."
            };
        }

        if (!Array.isArray(pedidos) || pedidos.length === 0) {
            console.warn("No hay pedidos para registrar como transacciones.");

            return {
                ok: false,
                error: "No hay pedidos para registrar."
            };
        }

        const transacciones = pedidos.map((pedido) => {
            return prepararTransaccionDesdePedido(pedido);
        });

        const { data, error } = await supabaseTransacciones
            .from("transacciones")
            .insert(transacciones)
            .select();

        if (error) {
            console.error("Error registrando transacciones en Supabase:", error);

            return {
                ok: false,
                error: error
            };
        }

        console.log("Transacciones registradas correctamente:", data);

        return {
            ok: true,
            data: data
        };
    }

    // Permite que otros archivos JS usen este módulo
    window.FoodFinderTransacciones = {
        registrarTransaccionesDesdePedidos
    };
})();