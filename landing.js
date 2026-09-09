// ==========================================
// landing.js
// Funcionalidad del Landing Page FoodFinder
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    const btnInicio =
        document.getElementById("btnInicio");

    const btnComoFunciona =
        document.getElementById("btnCfunciona");

    const btnSobreNosotros =
        document.getElementById("btnSNosotros");

    const btnFAQ =
        document.getElementById("btnFAQ");

    const btnIniciarSesion =
        document.getElementById("btnISesion");

    const btnCrearCuenta =
        document.getElementById("btnCCrear");

    const logo =
        document.querySelector(".navbar_LANDING img");

    const seccionBeneficios =
        document.querySelector(".BeneficiosProducto");

    const seccionComoFunciona =
        document.querySelector(".FlujoOperaciones_producto");

    const botonCrearCuentaCTA =
        document.querySelector(".Closer_CTA button");

    const footerItems =
        document.querySelectorAll("#pie_Landing p");

    const rutaLogin =
        "./features/Gestion de pedido/Pages/cuenta-cliente.html";

    const rutaRegistro =
        "./features/Gestion de pedido/Pages/cuenta-cliente.html?accion=registro";

    function scrollAElemento(elemento) {

        if (!elemento) {
            return;
        }

        elemento.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    }

    if (logo) {

        logo.style.cursor = "pointer";

        logo.addEventListener("click", () => {

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });

        });

    }

    if (btnInicio) {

        btnInicio.addEventListener("click", () => {

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });

        });

    }

    if (btnComoFunciona) {

        btnComoFunciona.addEventListener("click", () => {

            scrollAElemento(seccionComoFunciona);

        });

    }

    if (btnSobreNosotros) {

        btnSobreNosotros.addEventListener("click", () => {

            scrollAElemento(seccionBeneficios);

        });

    }

    if (btnFAQ) {

        btnFAQ.addEventListener("click", () => {

            alert(
                "Preguntas frecuentes:\n\n" +
                "1. ¿Necesito una cuenta? Sí, para acceder a la Web App.\n" +
                "2. ¿Puedo comprar como consumidor? Sí, desde la cuenta de cliente.\n" +
                "3. ¿Puedo gestionar mi restaurante? Sí, desde la cuenta de emprendedor.\n" +
                "4. ¿El pedido se guarda? Sí, se registra con LocalStorage para la demo."
            );

        });

    }

    if (btnIniciarSesion) {

        btnIniciarSesion.addEventListener("click", () => {

            window.location.href = rutaLogin;

        });

    }

    if (btnCrearCuenta) {

        btnCrearCuenta.addEventListener("click", () => {

            window.location.href = rutaRegistro;

        });

    }

    if (botonCrearCuentaCTA) {

        botonCrearCuentaCTA.addEventListener("click", () => {

            window.location.href = rutaRegistro;

        });

    }

    footerItems.forEach((item) => {

        const texto =
            item.textContent.trim().toLowerCase();

        if (
            texto.includes("seguridad") ||
            texto.includes("términos") ||
            texto.includes("terminos") ||
            texto.includes("cookies")
        ) {

            item.style.cursor = "pointer";

            item.addEventListener("click", () => {

                alert(
                    "Esta sección informativa estará disponible en la versión final de FoodFinder."
                );

            });

        }

    });

    const tarjetasCTA =
        document.querySelectorAll(".cartaCTA");

    tarjetasCTA.forEach((tarjeta) => {

        tarjeta.style.cursor = "pointer";

        tarjeta.addEventListener("click", () => {

            scrollAElemento(seccionComoFunciona);

        });

    });

    const tarjetasBeneficios =
        document.querySelectorAll(".TarjetaB > div");

    tarjetasBeneficios.forEach((tarjeta) => {

        tarjeta.style.cursor = "pointer";

        tarjeta.addEventListener("click", () => {

            scrollAElemento(seccionComoFunciona);

        });

    });

    const testimonios =
        document.querySelectorAll(".testimonio");

    testimonios.forEach((testimonio) => {

        testimonio.style.cursor = "pointer";

        testimonio.addEventListener("click", () => {

            alert(
                "Testimonio de usuario registrado para evidenciar validación del producto."
            );

        });

    });

});