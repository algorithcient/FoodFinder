// ==========================================
// cuenta.js
// Login / Registro FoodFinder
// Cliente + Cocinero + restaurante propio
// ==========================================

const SUPABASE_URL = "https://emqlgfmibvxdyipxubul.supabase.co";
const SUPABASE_KEY = "sb_publishable_sdiAONM5AeOf56mRe78fiw_YkP3uN46";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// =====================
// ELEMENTOS
// =====================

const pantallaLogin =
    document.getElementById("pantallaLogin");

const pantallaRol =
    document.getElementById("pantallaRol");

const pantallaRegistro =
    document.getElementById("pantallaRegistro");

const pantallaBienvenido =
    document.getElementById("pantallaBienvenido");

const btnVolverLanding =
    document.querySelector("#pantallaLogin .btn-volver");

const btnCrearCuenta =
    document.getElementById("btnCrearCuenta");

const btnConsumidor =
    document.getElementById("btnConsumidor");

const btnCocinero =
    document.getElementById("btnCocinero");

const volverLogin =
    document.getElementById("volverLogin");

const volverRol =
    document.getElementById("volverRol");

const correoLogin =
    document.getElementById("correoLogin");

const passwordLogin =
    document.getElementById("passwordLogin");

const btnIniciarSesionLogin =
    document.getElementById("btnIniciarSesionLogin");

const mensajeLogin =
    document.getElementById("mensajeLogin");

const tarjetaRegistro =
    document.getElementById("tarjetaRegistro");

const iconoRegistroRol =
    document.getElementById("iconoRegistroRol");

const tituloRegistro =
    document.getElementById("tituloRegistro");

const nombreCliente =
    document.getElementById("nombreCliente");

const correoCliente =
    document.getElementById("correoCliente");

const telefonoCliente =
    document.getElementById("telefonoCliente");

const direccionNegocio =
    document.getElementById("direccionNegocio");

const passwordCliente =
    document.getElementById("passwordCliente");

const grupoDireccionNegocio =
    document.getElementById("grupoDireccionNegocio");

const btnGuardarCuenta =
    document.getElementById("btnGuardarCuenta");

const errorNombre =
    document.getElementById("errorNombre");

const errorCorreo =
    document.getElementById("errorCorreo");

const errorTelefono =
    document.getElementById("errorTelefono");

const errorDireccionNegocio =
    document.getElementById("errorDireccionNegocio");

const errorPassword =
    document.getElementById("errorPassword");

const mensajeExito =
    document.getElementById("mensajeExito");

const mensajeSugerencia =
    document.getElementById("mensajeSugerencia");

const logoLogin =
    document.getElementById("logo");

const logoBienvenido =
    document.getElementById("logoBienvenido");

const formLogin =
    document.querySelector("#pantallaLogin form");

const formRegistro =
    document.getElementById("formRegistroCliente");


// =====================
// RUTAS
// =====================

const RUTA_LANDING =
    "../../../index.html";

const RUTA_HOME_CLIENTE =
    "../../Navegación/pages/home.html";

const RUTA_PANEL_COCINERO =
    "../../Gestion operativa de la cocina/pages/pedidos_entrantes.html";

const ICONO_CONSUMIDOR =
    "../../../Assests/Icons/consumidor.png";

const ICONO_COCINERO =
    "../../../Assests/Icons/chef.png";


// =====================
// ESTADO
// =====================

let rolSeleccionado =
    "";


// =====================
// PANTALLAS
// =====================

function mostrarPantalla(pantalla) {
    pantallaLogin.classList.remove("activa");
    pantallaRol.classList.remove("activa");
    pantallaRegistro.classList.remove("activa");
    pantallaBienvenido.classList.remove("activa");

    pantalla.classList.add("activa");
}


// =====================
// VALIDACIONES
// =====================

function validarCorreo(correo) {
    const expresionCorreo =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return expresionCorreo.test(correo);
}

function limpiarMensajes() {
    errorNombre.textContent =
        "";

    errorCorreo.textContent =
        "";

    errorTelefono.textContent =
        "";

    errorDireccionNegocio.textContent =
        "";

    errorPassword.textContent =
        "";

    mensajeExito.textContent =
        "";

    mensajeSugerencia.textContent =
        "";

    mensajeLogin.textContent =
        "";
}

function limpiarFormularioRegistro() {
    nombreCliente.value =
        "";

    correoCliente.value =
        "";

    telefonoCliente.value =
        "";

    direccionNegocio.value =
        "";

    passwordCliente.value =
        "";
}

function limpiarFormularioLogin() {
    correoLogin.value =
        "";

    passwordLogin.value =
        "";
}


// =====================
// LOCALSTORAGE
// =====================

function obtenerJSON(key) {
    try {
        return JSON.parse(
            localStorage.getItem(key)
        );
    } catch (error) {
        return null;
    }
}

function obtenerUsuariosRegistrados() {
    return obtenerJSON("usuariosRegistrados") || [];
}

function guardarUsuariosRegistrados(usuarios) {
    localStorage.setItem(
        "usuariosRegistrados",
        JSON.stringify(usuarios)
    );
}

function guardarUsuarioActivo(usuario) {
    localStorage.setItem(
        "usuarioActivo",
        JSON.stringify(usuario)
    );
}

function obtenerRestaurantesRegistrados() {
    return obtenerJSON("foodfinder_restaurantes") || [];
}

function guardarRestaurantesRegistrados(restaurantes) {
    localStorage.setItem(
        "foodfinder_restaurantes",
        JSON.stringify(restaurantes)
    );
}

function inicializarPlatosSiNoExisten() {
    const platos =
        localStorage.getItem("platos_data");

    if (platos === null) {
        localStorage.setItem(
            "platos_data",
            JSON.stringify([])
        );
    }
}


// =====================
// RESTAURANTES POR EMPRENDEDOR
// =====================

function crearNombreRestaurante(usuario) {
    const primerNombre =
        String(usuario.nombre || "Emprendedor")
            .split(" ")[0]
            .trim();

    return "Restaurante de " + primerNombre;
}

function crearOActualizarRestauranteDelUsuario(usuario) {
    if (usuario.rol !== "cocinero") {
        return null;
    }

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
            nombre: crearNombreRestaurante(usuario),
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
            fechaRegistro: new Date().toLocaleDateString()
        };

        restaurantes.push(restaurante);
    } else {
        restaurante.ownerName =
            usuario.nombre;

        restaurante.telefono =
            usuario.telefono || restaurante.telefono;

        restaurante.direccion =
            usuario.direccionNegocio || restaurante.direccion;
    }

    guardarRestaurantesRegistrados(restaurantes);

    return restaurante;
}

function prepararUsuarioCocinero(usuario) {
    if (usuario.rol !== "cocinero") {
        return usuario;
    }

    const restaurante =
        crearOActualizarRestauranteDelUsuario(usuario);

    usuario.restauranteId =
        restaurante.id;

    return usuario;
}

function asegurarRestauranteParaCocinero(usuario) {
    const usuarioPreparado =
        prepararUsuarioCocinero(usuario);

    const usuariosRegistrados =
        obtenerUsuariosRegistrados();

    const usuariosActualizados =
        usuariosRegistrados.map((item) => {
            if (item.correo === usuarioPreparado.correo) {
                return usuarioPreparado;
            }

            return item;
        });

    guardarUsuariosRegistrados(usuariosActualizados);

    return usuarioPreparado;
}


// =====================
// CONFIGURACIÓN DE REGISTRO
// =====================

function configurarRegistroPorRol(rol) {
    rolSeleccionado =
        rol;

    tarjetaRegistro.classList.remove("registro-cliente");
    tarjetaRegistro.classList.remove("registro-cocinero");

    if (rolSeleccionado === "cliente") {
        tituloRegistro.textContent =
            "Ingrese sus datos";

        iconoRegistroRol.src =
            ICONO_CONSUMIDOR;

        iconoRegistroRol.alt =
            "Consumidor";

        tarjetaRegistro.classList.add("registro-cliente");

        grupoDireccionNegocio.style.display =
            "none";
    }

    if (rolSeleccionado === "cocinero") {
        tituloRegistro.textContent =
            "Ingrese sus datos";

        iconoRegistroRol.src =
            ICONO_COCINERO;

        iconoRegistroRol.alt =
            "Cocinero";

        tarjetaRegistro.classList.add("registro-cocinero");

        grupoDireccionNegocio.style.display =
            "block";
    }

    limpiarMensajes();
    limpiarFormularioRegistro();
    mostrarPantalla(pantallaRegistro);
}


// =====================
// REDIRECCIONES
// =====================

function redirigirSegunRol(usuario) {
    if (usuario.rol === "cliente") {
        window.location.href =
            RUTA_HOME_CLIENTE;

        return;
    }

    if (usuario.rol === "cocinero") {
        window.location.href =
            RUTA_PANEL_COCINERO;

        return;
    }

    window.location.href =
        RUTA_LANDING;
}

function volverAlLanding() {
    window.location.href =
        RUTA_LANDING;
}


// =====================
// REGISTRO
// =====================

async function guardarCuenta() {
    limpiarMensajes();

    const nombre =
        nombreCliente.value.trim();

    const correo =
        correoCliente.value.trim().toLowerCase();

    const telefono =
        telefonoCliente.value.trim();

    const direccion =
        direccionNegocio.value.trim();

    const password =
        passwordCliente.value.trim();

    let formularioValido =
        true;

    if (nombre === "") {
        errorNombre.textContent =
            "Ingrese su nombre completo";

        formularioValido =
            false;
    }

    if (correo === "") {
        errorCorreo.textContent =
            "Ingrese su correo electrónico";

        formularioValido =
            false;
    } else if (!validarCorreo(correo)) {
        errorCorreo.textContent =
            "Ingrese un correo electrónico válido";

        formularioValido =
            false;
    }

    if (telefono === "") {
        errorTelefono.textContent =
            "Ingrese su teléfono o celular";

        formularioValido =
            false;
    }

    if (rolSeleccionado === "cocinero" && direccion === "") {
        errorDireccionNegocio.textContent =
            "Ingrese la dirección de su negocio";

        formularioValido =
            false;
    }

    if (password === "") {
        errorPassword.textContent =
            "Ingrese una contraseña";

        formularioValido =
            false;
    }

    if (rolSeleccionado === "") {
        mensajeSugerencia.textContent =
            "Seleccione un rol antes de crear la cuenta.";

        formularioValido =
            false;
    }

    if (!formularioValido) {
        return;
    }

    const { data: usuarioExistente, error: errorConsulta } = await supabaseClient
    .from("usuarios")
    .select("*")
    .eq("correo", correo)
    .maybeSingle();

    if (errorConsulta) {
    mensajeSugerencia.textContent = errorConsulta.message;
    console.log("ERROR COMPLETO:", errorConsulta);
    return;
    }

    if (usuarioExistente) {
        errorCorreo.textContent = "Este correo ya está en uso";
        mensajeSugerencia.textContent = "Ya tienes una cuenta registrada. Puedes iniciar sesión.";
        return;
    }

    let nuevoUsuario = {
        nombre: nombre,
        correo: correo,
        telefono: telefono,
        direccion_negocio: rolSeleccionado === "cocinero" ? direccion : "",
        password: password,
        rol: rolSeleccionado,
        fecha_registro: new Date().toISOString()
    };

    const { data, error } = await supabaseClient
        .from("usuarios")
        .insert([nuevoUsuario])
        .select()
        .single();

    if (error) {
        mensajeSugerencia.textContent = "No se pudo guardar la cuenta.";
        console.error(error);
        return;
    }

    guardarUsuarioActivo(data);
    inicializarPlatosSiNoExisten();

        limpiarFormularioRegistro();

        mostrarPantalla(pantallaBienvenido);

        setTimeout(() => {
            redirigirSegunRol(data);
        }, 1500);
}


// =====================
// LOGIN
// =====================

async function iniciarSesion() {
    limpiarMensajes();

    const correo =
        correoLogin.value.trim().toLowerCase();

    const password =
        passwordLogin.value.trim();

    if (correo === "" || password === "") {
        mensajeLogin.textContent =
            "Ingrese su correo y contraseña.";

        return;
    }

    const { data: usuarioEncontrado, error } = await supabaseClient
        .from("usuarios")
        .select("*")
        .eq("correo", correo)
        .eq("password", password)
        .maybeSingle();

    if (error) {
        mensajeLogin.textContent = "Error al consultar la base de datos.";
        console.error(error);
        return;
    }

    if (!usuarioEncontrado) {
    mensajeLogin.textContent = "Correo o contraseña incorrectos.";
    return;
}

guardarUsuarioActivo(usuarioEncontrado);
inicializarPlatosSiNoExisten();

redirigirSegunRol(usuarioEncontrado);
}


// =====================
// EVENTOS
// =====================

if (btnVolverLanding) {
    btnVolverLanding.addEventListener("click", () => {
        volverAlLanding();
    });
}

if (logoLogin) {
    logoLogin.style.cursor =
        "pointer";

    logoLogin.addEventListener("click", () => {
        volverAlLanding();
    });
}

if (logoBienvenido) {
    logoBienvenido.style.cursor =
        "pointer";

    logoBienvenido.addEventListener("click", () => {
        volverAlLanding();
    });
}

btnCrearCuenta.addEventListener("click", () => {
    limpiarMensajes();
    mostrarPantalla(pantallaRol);
});

btnConsumidor.addEventListener("click", () => {
    configurarRegistroPorRol("cliente");
});

btnCocinero.addEventListener("click", () => {
    configurarRegistroPorRol("cocinero");
});

volverLogin.addEventListener("click", () => {
    limpiarMensajes();
    limpiarFormularioLogin();
    mostrarPantalla(pantallaLogin);
});

volverRol.addEventListener("click", () => {
    limpiarMensajes();
    mostrarPantalla(pantallaRol);
});

btnGuardarCuenta.addEventListener("click", () => {
    guardarCuenta();
});

btnIniciarSesionLogin.addEventListener("click", () => {
    iniciarSesion();
});

if (formLogin) {
    formLogin.addEventListener("submit", (e) => {
        e.preventDefault();
        iniciarSesion();
    });
}

if (formRegistro) {
    formRegistro.addEventListener("submit", (e) => {
        e.preventDefault();
        guardarCuenta();
    });
}


// =====================
// ABRIR REGISTRO DESDE LANDING
// =====================

const parametrosURL =
    new URLSearchParams(window.location.search);

const accion =
    parametrosURL.get("accion");

if (accion === "registro") {
    limpiarMensajes();
    mostrarPantalla(pantallaRol);
}

if (accion === "registro-cliente") {
    configurarRegistroPorRol("cliente");
}

if (accion === "registro-cocinero") {
    configurarRegistroPorRol("cocinero");
}