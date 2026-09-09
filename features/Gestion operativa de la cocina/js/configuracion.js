const SUPABASE_URL = "https://emqlgfmibvxdyipxubul.supabase.co";
const SUPABASE_KEY = "sb_publishable_sdiAONM5AeOf56mRe78fiw_YkP3uN46";
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

document.addEventListener("DOMContentLoaded", async function () {

    // =====================
    // SESIÓN Y RESTAURANTE ACTIVO
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

    function obtenerRestaurantesRegistrados() {
        return obtenerDatos("foodfinder_restaurantes");
    }

    function guardarRestaurantesRegistrados(restaurantes) {
        guardarDatos(
            "foodfinder_restaurantes",
            restaurantes
        );
    }

    function actualizarUsuarioRegistrado(usuarioActualizado) {
        const usuarios =
            obtenerDatos("usuariosRegistrados");

        const usuariosActualizados =
            usuarios.map((usuario) => {
                if (usuario.correo === usuarioActualizado.correo) {
                    return {
                        ...usuario,
                        ...usuarioActualizado
                    };
                }

                return usuario;
            });

        guardarDatos(
            "usuariosRegistrados",
            usuariosActualizados
        );
    }

    function crearRestauranteSiNoExiste(usuario) {
        const restaurantes =
            obtenerRestaurantesRegistrados();

        let restaurante =
            restaurantes.find((item) => {
                return (
                    item.id === usuario.restauranteId ||
                    item.ownerEmail === usuario.correo
                );
            });

        if (!restaurante) {
            restaurante = {
                id: usuario.restauranteId || "rest_" + usuario.id,
                ownerEmail: usuario.correo,
                ownerName: usuario.nombre,
                nombre: "Restaurante de " + usuario.nombre.split(" ")[0],
                cocina: "Emprendimiento gastronómico",
                descripcion: "Restaurante registrado en FoodFinder.",
                direccion: usuario.direccionNegocio || "Dirección pendiente",
                distrito: "Lima",
                telefono: usuario.telefono || "",
                horario: "Lun–Dom 12:00pm – 10:00pm",
                estado: "Abierto",
                rating: 4.8,
                reviews: 0,
                imagen: "../../../Assests/Img/El rincon del sabor.jpg",
                logo: "../../../Assests/Icons/LogoPrincipal.svg",
                fechaRegistro: new Date().toLocaleDateString()
            };

            restaurantes.push(restaurante);

            guardarRestaurantesRegistrados(restaurantes);
        }

        if (!usuario.restauranteId) {
            usuario.restauranteId =
                restaurante.id;

            localStorage.setItem(
                "usuarioActivo",
                JSON.stringify(usuario)
            );

            actualizarUsuarioRegistrado(usuario);
        }

        return restaurante;
    }

    const usuarioActivo =
        obtenerUsuarioActivo();

    if (!usuarioActivo) {
        alert("Debes iniciar sesión para acceder al panel.");

        window.location.href =
            "../../Gestion de pedido/Pages/cuenta-cliente.html";

        return;
    }

    if (usuarioActivo.rol !== "cocinero") {
        alert("Esta sección es solo para emprendedores gastronómicos.");

        window.location.href =
            "../../Navegación/pages/home.html";

        return;
    }

    const restauranteActual =
        crearRestauranteSiNoExiste(usuarioActivo);

    const CLAVE_INFO =
        "config_info_restaurante_" + restauranteActual.id;

    const CLAVE_HORARIOS =
        "config_horarios_" + restauranteActual.id;


    // =====================
    // REFERENCIAS DOM
    // =====================

    const inputNombre =
        document.getElementById("nombre-restaurante");

    const inputCocina =
        document.getElementById("cocina-restaurante");

    const inputDescripcion =
        document.getElementById("descripcion");

    const inputDireccion =
        document.getElementById("direccion-restaurante");

    const inputDistrito =
        document.getElementById("distrito-restaurante");

    const inputTelefono =
        document.getElementById("telefono");

    const inputEstado =
        document.getElementById("estado-restaurante");

    const btnGuardarInfo =
        document.getElementById("btn-guardar-info");

    const btnActualizar =
        document.getElementById("btn-actualizar-horarios");

    const btnFoto =
        document.getElementById("btn-foto");

    const btnLogo =
        document.getElementById("btn-logo");

    const inputFoto =
        document.getElementById("input-foto");

    const inputLogo =
        document.getElementById("input-logo");

    const previewFoto =
        document.getElementById("preview-foto");

    const previewLogo =
        document.getElementById("preview-logo");

    const toast =
        document.getElementById("toast");

    const horarios = [
        {
            clave: "lv",
            toggle: document.getElementById("toggle-lv"),
            inicio: document.getElementById("lv-inicio"),
            fin: document.getElementById("lv-fin")
        },
        {
            clave: "sa",
            toggle: document.getElementById("toggle-sa"),
            inicio: document.getElementById("sa-inicio"),
            fin: document.getElementById("sa-fin")
        },
        {
            clave: "do",
            toggle: document.getElementById("toggle-do"),
            inicio: document.getElementById("do-inicio"),
            fin: document.getElementById("do-fin")
        }
    ];


    // =====================
    // UTILIDADES
    // =====================

    function mostrarToast(mensaje) {
        if (!toast) {
            alert(mensaje);
            return;
        }

        toast.textContent =
            mensaje;

        toast.classList.add("visible");

        setTimeout(function () {
            toast.classList.remove("visible");
        }, 2500);
    }

    function obtenerJSON(key) {
        try {
            return JSON.parse(
                localStorage.getItem(key)
            );
        } catch (error) {
            return null;
        }
    }

    function actualizarRestauranteEnCatalogo(datosActualizados) {
        const restaurantes =
            obtenerRestaurantesRegistrados();

        const index =
            restaurantes.findIndex((item) => {
                return (
                    item.id === restauranteActual.id ||
                    item.ownerEmail === restauranteActual.ownerEmail
                );
            });

        if (index !== -1) {
            restaurantes[index] = {
                ...restaurantes[index],
                ...datosActualizados
            };

            Object.assign(
                restauranteActual,
                datosActualizados
            );

            guardarRestaurantesRegistrados(restaurantes);
        }
    }

    function construirTextoHorario(datos) {
        const partes = [];

        if (datos.lv && !datos.lv.cerrado) {
            partes.push(
                "Lun–Vie " + datos.lv.inicio + " – " + datos.lv.fin
            );
        }

        if (datos.sa && !datos.sa.cerrado) {
            partes.push(
                "Sáb " + datos.sa.inicio + " – " + datos.sa.fin
            );
        }

        if (datos.do && !datos.do.cerrado) {
            partes.push(
                "Dom " + datos.do.inicio + " – " + datos.do.fin
            );
        }

        if (partes.length === 0) {
            return "Cerrado temporalmente";
        }

        return partes.join(" / ");
    }

    function mostrarPreview(img, src) {
        if (!img || !src) {
            return;
        }

        img.src =
            src;

        img.style.display =
            "block";
    }

    function limpiarErrores() {
        [
            inputNombre,
            inputCocina,
            inputDescripcion,
            inputDireccion,
            inputDistrito,
            inputTelefono
        ].forEach(function (el) {
            if (el) {
                el.classList.remove("campo-error");
            }
        });
    }


    // =====================
    // CARGAR INFORMACIÓN DESDE SUPABASE
    // =====================

    async function cargarInfo() {
        if (!usuarioActivo) return;

        // Intentamos traer el restaurante asociado al usuario desde Supabase
        const { data: restaurante, error } = await supabaseClient
            .from("restaurantes")
            .select("*")
            .eq("usuario_id", usuarioActivo.id)
            .maybeSingle();

        if (error) {
            console.error("Error al cargar de BD:", error);
        }

        // Si existe en Supabase, rellenamos el formulario con esos datos reales
        if (restaurante) {
            if (inputNombre) inputNombre.value = restaurante.nombre || "";
            if (inputCocina) inputCocina.value = restaurante.cocina || "";
            if (inputDescripcion) inputDescripcion.value = restaurante.descripcion || "";
            if (inputDireccion) inputDireccion.value = restaurante.direccion || "";
            if (inputDistrito) inputDistrito.value = restaurante.distrito || "";
            if (inputTelefono) inputTelefono.value = restaurante.telefono || "";
            if (inputEstado) inputEstado.value = restaurante.estado || "Abierto";
            
            // Si decides guardar imágenes en la tabla, las pintamos; si no, dejamos vacío
            if (restaurante.imagen) mostrarPreview(previewFoto, restaurante.imagen);
            if (restaurante.logo) mostrarPreview(previewLogo, restaurante.logo);
        } else {
            // Si no existe aún en Supabase, dejamos el comportamiento original (Local)
            let datos = obtenerJSON(CLAVE_INFO);
            if (!datos) {
                datos = {
                    restauranteId: restauranteActual.id,
                    ownerEmail: restauranteActual.ownerEmail,
                    nombre: restauranteActual.nombre || "",
                    cocina: restauranteActual.cocina || "",
                    descripcion: restauranteActual.descripcion || "",
                    direccion: restauranteActual.direccion || "",
                    distrito: restauranteActual.distrito || "",
                    telefono: restauranteActual.telefono || "",
                    estado: restauranteActual.estado || "Abierto",
                    imagen: restauranteActual.imagen || "",
                    logo: restauranteActual.logo || ""
                };
            }

            if (inputNombre) inputNombre.value = datos.nombre || "";
            if (inputCocina) inputCocina.value = datos.cocina || "";
            if (inputDescripcion) inputDescripcion.value = datos.descripcion || "";
            if (inputDireccion) inputDireccion.value = datos.direccion || "";
            if (inputDistrito) inputDistrito.value = datos.distrito || "";
            if (inputTelefono) inputTelefono.value = datos.telefono || "";
            if (inputEstado) inputEstado.value = datos.estado || "Abierto";

            mostrarPreview(previewFoto, datos.imagen);
            mostrarPreview(previewLogo, datos.logo);
        }
    }


  
    // =====================
    // GUARDAR INFORMACIÓN EN SUPABASE
    // =====================

    if (btnGuardarInfo) {
        // Añadimos 'async' a la función anónima para poder usar 'await' con Supabase
        btnGuardarInfo.addEventListener("click", async function () {
            const nombre = inputNombre.value.trim();
            const cocina = inputCocina.value.trim();
            const descripcion = inputDescripcion.value.trim();
            const direccion = inputDireccion.value.trim();
            const distrito = inputDistrito.value.trim();
            const telefono = inputTelefono.value.trim();
            const estado = inputEstado.value;

            limpiarErrores();

            let valido = true;

            const campos = [
                { input: inputNombre, valor: nombre },
                { input: inputCocina, valor: cocina },
                { input: inputDescripcion, valor: descripcion },
                { input: inputDireccion, valor: direccion },
                { input: inputDistrito, valor: distrito },
                { input: inputTelefono, valor: telefono }
            ];

            campos.forEach((campo) => {
                if (!campo.valor) {
                    campo.input.classList.add("campo-error");
                    valido = false;
                }
            });

            if (!valido) {
                mostrarToast("Por favor, completa todos los campos.");
                return;
            }

            // --- CONEXIÓN A SUPABASE ---
            // Guardamos o actualizamos en la tabla 'restaurantes' usando el usuario_id
            const { data, error } = await supabaseClient
                .from("restaurantes")
                .upsert({
                    nombre: nombre,
                    telefono: telefono,
                    direccion: direccion,
                    //categoria: cocina, // Mapeado a la columna 'categoria' que creaste
                    cocina: cocina,
                    descripcion: descripcion,
                    distrito: distrito,
                    estado: estado,
                    usuario_id: usuarioActivo.id // Enlace con la tabla usuarios
                }, { onConflict: 'usuario_id' }); // Si ya tiene restaurante, lo sobreescribe

            if (error) {
                console.error("Error al guardar en Supab:ase", error);
                mostrarToast("Hubo un error al guardar en la base de datos.");
                return;
            }

            // Guardado de respaldo en LocalStorage (para no romper las otras vistas de tus compañeros)
            const datosActuales = obtenerJSON(CLAVE_INFO) || {};
            const datosInfo = {
                ...datosActuales,
                restauranteId: restauranteActual.id,
                ownerEmail: usuarioActivo.correo,
                nombre,
                cocina,
                descripcion,
                direccion,
                distrito,
                telefono,
                estado
            };

            localStorage.setItem(CLAVE_INFO, JSON.stringify(datosInfo));

            actualizarRestauranteEnCatalogo({
                nombre,
                cocina,
                descripcion,
                direccion,
                distrito,
                telefono,
                estado
            });

            mostrarToast("Información guardada correctamente.");
        });
    }

    [
        inputNombre,
        inputCocina,
        inputDescripcion,
        inputDireccion,
        inputDistrito,
        inputTelefono
    ].forEach(function (el) {
        if (!el) {
            return;
        }

        el.addEventListener("input", function () {
            el.classList.remove("campo-error");
        });
    });


    // =====================
    // FOTO / LOGO
    // =====================

    function guardarArchivoComoBase64(input, callback) {
        if (!input || !input.files || input.files.length === 0) {
            return;
        }

        const archivo =
            input.files[0];

        if (!archivo.type.startsWith("image/")) {
            mostrarToast("Selecciona una imagen válida.");
            return;
        }

        const lector =
            new FileReader();

        lector.onload =
            function () {
                callback(
                    lector.result,
                    archivo.name
                );
            };

        lector.readAsDataURL(archivo);
    }

    if (btnFoto && inputFoto) {
        btnFoto.addEventListener("click", function () {
            inputFoto.click();
        });
    }

    if (btnLogo && inputLogo) {
        btnLogo.addEventListener("click", function () {
            inputLogo.click();
        });
    }

    if (inputFoto) {
        inputFoto.addEventListener("change", function () {
            guardarArchivoComoBase64(inputFoto, function (imagenBase64, nombreArchivo) {
                if (btnFoto) {
                    btnFoto.textContent =
                        nombreArchivo;
                }

                mostrarPreview(
                    previewFoto,
                    imagenBase64
                );

                const datosActuales =
                    obtenerJSON(CLAVE_INFO) || {};

                const datosInfo = {
                    ...datosActuales,
                    restauranteId: restauranteActual.id,
                    ownerEmail: usuarioActivo.correo,
                    nombre: inputNombre ? inputNombre.value.trim() : restauranteActual.nombre,
                    cocina: inputCocina ? inputCocina.value.trim() : restauranteActual.cocina,
                    descripcion: inputDescripcion ? inputDescripcion.value.trim() : restauranteActual.descripcion,
                    direccion: inputDireccion ? inputDireccion.value.trim() : restauranteActual.direccion,
                    distrito: inputDistrito ? inputDistrito.value.trim() : restauranteActual.distrito,
                    telefono: inputTelefono ? inputTelefono.value.trim() : restauranteActual.telefono,
                    estado: inputEstado ? inputEstado.value : restauranteActual.estado,
                    imagen: imagenBase64
                };

                localStorage.setItem(
                    CLAVE_INFO,
                    JSON.stringify(datosInfo)
                );

                actualizarRestauranteEnCatalogo({
                    imagen: imagenBase64
                });

                mostrarToast("Foto del restaurante actualizada correctamente.");
            });
        });
    }

    if (inputLogo) {
        inputLogo.addEventListener("change", function () {
            guardarArchivoComoBase64(inputLogo, function (logoBase64, nombreArchivo) {
                if (btnLogo) {
                    btnLogo.textContent =
                        nombreArchivo;
                }

                mostrarPreview(
                    previewLogo,
                    logoBase64
                );

                const datosActuales =
                    obtenerJSON(CLAVE_INFO) || {};

                const datosInfo = {
                    ...datosActuales,
                    restauranteId: restauranteActual.id,
                    ownerEmail: usuarioActivo.correo,
                    nombre: inputNombre ? inputNombre.value.trim() : restauranteActual.nombre,
                    cocina: inputCocina ? inputCocina.value.trim() : restauranteActual.cocina,
                    descripcion: inputDescripcion ? inputDescripcion.value.trim() : restauranteActual.descripcion,
                    direccion: inputDireccion ? inputDireccion.value.trim() : restauranteActual.direccion,
                    distrito: inputDistrito ? inputDistrito.value.trim() : restauranteActual.distrito,
                    telefono: inputTelefono ? inputTelefono.value.trim() : restauranteActual.telefono,
                    estado: inputEstado ? inputEstado.value : restauranteActual.estado,
                    logo: logoBase64
                };

                localStorage.setItem(
                    CLAVE_INFO,
                    JSON.stringify(datosInfo)
                );

                actualizarRestauranteEnCatalogo({
                    logo: logoBase64
                });

                mostrarToast("Logo actualizado correctamente.");
            });
        });
    }


    // =====================
    // HORARIOS
    // =====================

    function aplicarEstadoCerrado(item) {
        if (!item.toggle || !item.inicio || !item.fin) {
            return;
        }

        const cerrado =
            item.toggle.checked;

        item.inicio.disabled =
            cerrado;

        item.fin.disabled =
            cerrado;
    }

    horarios.forEach(function (item) {
        if (!item.toggle) {
            return;
        }

        item.toggle.addEventListener("change", function () {
            aplicarEstadoCerrado(item);
        });
    });

    function cargarHorarios() {
        const datos =
            obtenerJSON(CLAVE_HORARIOS);

        if (!datos) {
            horarios.forEach(aplicarEstadoCerrado);
            return;
        }

        horarios.forEach(function (item) {
            const horarioGuardado =
                datos[item.clave];

            if (!horarioGuardado) {
                return;
            }

            if (item.inicio) {
                item.inicio.value =
                    horarioGuardado.inicio || item.inicio.value;
            }

            if (item.fin) {
                item.fin.value =
                    horarioGuardado.fin || item.fin.value;
            }

            if (item.toggle) {
                item.toggle.checked =
                    horarioGuardado.cerrado || false;
            }

            aplicarEstadoCerrado(item);
        });
    }

    if (btnActualizar) {
        btnActualizar.addEventListener("click", function () {
            const datos = {
                lv: {
                    inicio: horarios[0].inicio ? horarios[0].inicio.value : "",
                    fin: horarios[0].fin ? horarios[0].fin.value : "",
                    cerrado: horarios[0].toggle ? horarios[0].toggle.checked : false
                },
                sa: {
                    inicio: horarios[1].inicio ? horarios[1].inicio.value : "",
                    fin: horarios[1].fin ? horarios[1].fin.value : "",
                    cerrado: horarios[1].toggle ? horarios[1].toggle.checked : false
                },
                do: {
                    inicio: horarios[2].inicio ? horarios[2].inicio.value : "",
                    fin: horarios[2].fin ? horarios[2].fin.value : "",
                    cerrado: horarios[2].toggle ? horarios[2].toggle.checked : false
                }
            };

            localStorage.setItem(
                CLAVE_HORARIOS,
                JSON.stringify(datos)
            );

            actualizarRestauranteEnCatalogo({
                horario: construirTextoHorario(datos)
            });

            mostrarToast("Horarios actualizados correctamente.");
        });
    }


    // =====================
    // NAVEGACIÓN SUPERIOR PANEL RESTAURANTE
    // =====================

    function configurarNavegacionPanel() {
        const btnDashboard =
            document.getElementById("btn_dashboard") ||
            document.getElementById("btnDashboard") ||
            document.getElementById("btn_Dashboard");

        const btnLogoPanel =
            document.getElementById("btn-logo-panel");

        const btnBuscarPanel =
            document.getElementById("btn-buscar-panel");

        const btnPerfilPanel =
            document.getElementById("btn-perfil-panel");

        const btnSalir =
            document.getElementById("btn-salir");

        if (btnLogoPanel) {
            btnLogoPanel.addEventListener("click", function (e) {
                e.preventDefault();

                window.location.href =
                    "pedidos_entrantes.html";
            });
        }

        if (btnDashboard) {
            btnDashboard.addEventListener("click", function (e) {
                e.preventDefault();

                window.location.href =
                    "pedidos_entrantes.html";
            });
        }

        if (btnBuscarPanel) {
            btnBuscarPanel.addEventListener("click", function () {
                alert(
                    "Desde Configuración puedes actualizar los datos públicos de tu restaurante."
                );
            });
        }

        if (btnPerfilPanel) {
            btnPerfilPanel.addEventListener("click", function () {
                mostrarToast("Ya estás en la configuración del perfil del restaurante.");
            });
        }

        if (btnSalir) {
            btnSalir.addEventListener("click", function (e) {
                e.preventDefault();

                const confirmar =
                    confirm("¿Deseas cerrar sesión?");

                if (!confirmar) {
                    return;
                }

                localStorage.removeItem("usuarioActivo");

                alert("Sesión cerrada correctamente.");

                window.location.href =
                    "../../../index.html";
            });
        }
    }


    // =====================
    // INICIALIZAR
    // =====================

    await cargarInfo();
    cargarHorarios();
    configurarNavegacionPanel();

});

document.addEventListener("DOMContentLoaded", () => {
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