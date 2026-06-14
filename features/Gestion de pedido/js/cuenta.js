const pantallaLogin = document.getElementById("pantallaLogin");
const pantallaRol = document.getElementById("pantallaRol");
const pantallaRegistro = document.getElementById("pantallaRegistro");

const btnCrearCuenta = document.getElementById("btnCrearCuenta");
const btnConsumidor = document.getElementById("btnConsumidor");
const btnCocinero = document.getElementById("btnCocinero");
const volverLogin = document.getElementById("volverLogin");
const volverRol = document.getElementById("volverRol");

const correoLogin = document.getElementById("correoLogin");
const passwordLogin = document.getElementById("passwordLogin");
const btnIniciarSesionLogin = document.getElementById("btnIniciarSesionLogin");
const mensajeLogin = document.getElementById("mensajeLogin");

const tarjetaRegistro = document.getElementById("tarjetaRegistro");
const iconoRegistroRol = document.getElementById("iconoRegistroRol");
const tituloRegistro = document.getElementById("tituloRegistro");

const nombreCliente = document.getElementById("nombreCliente");
const correoCliente = document.getElementById("correoCliente");
const telefonoCliente = document.getElementById("telefonoCliente");
const direccionNegocio = document.getElementById("direccionNegocio");
const passwordCliente = document.getElementById("passwordCliente");

const grupoDireccionNegocio = document.getElementById("grupoDireccionNegocio");

const btnGuardarCuenta = document.getElementById("btnGuardarCuenta");

const errorNombre = document.getElementById("errorNombre");
const errorCorreo = document.getElementById("errorCorreo");
const errorTelefono = document.getElementById("errorTelefono");
const errorDireccionNegocio = document.getElementById("errorDireccionNegocio");
const errorPassword = document.getElementById("errorPassword");

const mensajeExito = document.getElementById("mensajeExito");
const mensajeSugerencia = document.getElementById("mensajeSugerencia");

let rolSeleccionado = "";

function mostrarPantalla(pantalla) {
    pantallaLogin.classList.remove("activa");
    pantallaRol.classList.remove("activa");
    pantallaRegistro.classList.remove("activa");

    pantalla.classList.add("activa");
}

function validarCorreo(correo) {
    const expresionCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return expresionCorreo.test(correo);
}

function limpiarMensajes() {
    errorNombre.textContent = "";
    errorCorreo.textContent = "";
    errorTelefono.textContent = "";
    errorDireccionNegocio.textContent = "";
    errorPassword.textContent = "";
    mensajeExito.textContent = "";
    mensajeSugerencia.textContent = "";
    mensajeLogin.textContent = "";
}

function limpiarFormularioRegistro() {
    nombreCliente.value = "";
    correoCliente.value = "";
    telefonoCliente.value = "";
    direccionNegocio.value = "";
    passwordCliente.value = "";
}

function obtenerUsuariosRegistrados() {
    const usuarios = localStorage.getItem("usuariosRegistrados");

    if (usuarios === null) {
        return [];
    }

    return JSON.parse(usuarios);
}

function guardarUsuariosRegistrados(usuarios) {
    localStorage.setItem("usuariosRegistrados", JSON.stringify(usuarios));
}

function guardarUsuarioActivo(usuario) {
    localStorage.setItem("usuarioActivo", JSON.stringify(usuario));
}

function inicializarPlatosSiNoExisten() {
    const platos = localStorage.getItem("platos");

    if (platos === null) {
        localStorage.setItem("platos", JSON.stringify([]));
    }
}

function configurarRegistroPorRol(rol) {
    rolSeleccionado = rol;

    tarjetaRegistro.classList.remove("registro-cliente");
    tarjetaRegistro.classList.remove("registro-cocinero");

    if (rolSeleccionado === "cliente") {
        tituloRegistro.textContent = "Ingrese sus datos";
        iconoRegistroRol.src = "/Assests/Icons/consumidor.png";
        iconoRegistroRol.alt = "Consumidor";

        tarjetaRegistro.classList.add("registro-cliente");
        grupoDireccionNegocio.style.display = "none";
    }

    if (rolSeleccionado === "cocinero") {
        tituloRegistro.textContent = "Ingrese sus datos";
        iconoRegistroRol.src = "/Assests/Icons/chef.png";
        iconoRegistroRol.alt = "Cocinero";

        tarjetaRegistro.classList.add("registro-cocinero");
        grupoDireccionNegocio.style.display = "block";
    }

    limpiarMensajes();
    limpiarFormularioRegistro();
    mostrarPantalla(pantallaRegistro);
}

function redirigirSegunRol(usuario) {
    if (usuario.rol === "cliente") {
        window.location.href = "detalles-cliente.html";
        return;
    }

    if (usuario.rol === "cocinero") {
        window.location.href = "../../Gestion operativa de la cocina/mis_platos.html";
        return;
    }
}

btnCrearCuenta.addEventListener("click", function () {
    limpiarMensajes();
    mostrarPantalla(pantallaRol);
});

btnConsumidor.addEventListener("click", function () {
    configurarRegistroPorRol("cliente");
});

btnCocinero.addEventListener("click", function () {
    configurarRegistroPorRol("cocinero");
});

volverLogin.addEventListener("click", function () {
    limpiarMensajes();
    mostrarPantalla(pantallaLogin);
});

volverRol.addEventListener("click", function () {
    limpiarMensajes();
    mostrarPantalla(pantallaRol);
});

btnGuardarCuenta.addEventListener("click", function () {
    limpiarMensajes();

    const nombre = nombreCliente.value.trim();
    const correo = correoCliente.value.trim().toLowerCase();
    const telefono = telefonoCliente.value.trim();
    const direccion = direccionNegocio.value.trim();
    const password = passwordCliente.value.trim();

    let formularioValido = true;

    if (nombre === "") {
        errorNombre.textContent = "Ingrese su nombre completo";
        formularioValido = false;
    }

    if (correo === "") {
        errorCorreo.textContent = "Ingrese su correo electrónico";
        formularioValido = false;
    } else if (!validarCorreo(correo)) {
        errorCorreo.textContent = "Ingrese un correo electrónico válido";
        formularioValido = false;
    }

    if (telefono === "") {
        errorTelefono.textContent = "Ingrese su teléfono o celular";
        formularioValido = false;
    }

    if (rolSeleccionado === "cocinero" && direccion === "") {
        errorDireccionNegocio.textContent = "Ingrese la dirección de su negocio";
        formularioValido = false;
    }

    if (password === "") {
        errorPassword.textContent = "Ingrese una contraseña";
        formularioValido = false;
    }

    if (rolSeleccionado === "") {
        mensajeSugerencia.textContent = "Seleccione un rol antes de crear la cuenta.";
        formularioValido = false;
    }

    if (!formularioValido) {
        return;
    }

    const usuariosRegistrados = obtenerUsuariosRegistrados();

    const correoExiste = usuariosRegistrados.some(function (usuario) {
        return usuario.correo === correo;
    });

    if (correoExiste) {
        errorCorreo.textContent = "Este correo ya está en uso";
        mensajeSugerencia.textContent = "Ya tienes una cuenta registrada. Puedes iniciar sesión.";
        return;
    }

    const nuevoUsuario = {
        id: Date.now(),
        nombre: nombre,
        correo: correo,
        telefono: telefono,
        direccionNegocio: rolSeleccionado === "cocinero" ? direccion : "",
        password: password,
        rol: rolSeleccionado,
        fechaRegistro: new Date().toLocaleDateString()
    };

    usuariosRegistrados.push(nuevoUsuario);

    guardarUsuariosRegistrados(usuariosRegistrados);
    guardarUsuarioActivo(nuevoUsuario);
    inicializarPlatosSiNoExisten();

    mensajeExito.textContent = "Cuenta creada correctamente. Tus datos se guardaron correctamente.";

    limpiarFormularioRegistro();

    setTimeout(function () {
        redirigirSegunRol(nuevoUsuario);
    }, 1200);
});

btnIniciarSesionLogin.addEventListener("click", function () {
    limpiarMensajes();

    const correo = correoLogin.value.trim().toLowerCase();
    const password = passwordLogin.value.trim();

    if (correo === "" || password === "") {
        mensajeLogin.textContent = "Ingrese su correo y contraseña.";
        return;
    }

    const usuariosRegistrados = obtenerUsuariosRegistrados();

    const usuarioEncontrado = usuariosRegistrados.find(function (usuario) {
        return usuario.correo === correo && usuario.password === password;
    });

    if (usuarioEncontrado === undefined) {
        mensajeLogin.textContent = "Correo o contraseña incorrectos.";
        return;
    }

    guardarUsuarioActivo(usuarioEncontrado);
    inicializarPlatosSiNoExisten();

    redirigirSegunRol(usuarioEncontrado);
});