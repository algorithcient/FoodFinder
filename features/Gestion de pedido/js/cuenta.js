const pantallaLogin = document.getElementById("pantallaLogin");
const pantallaRol = document.getElementById("pantallaRol");
const pantallaRegistro = document.getElementById("pantallaRegistro");

const btnCrearCuenta = document.getElementById("btnCrearCuenta");
const btnConsumidor = document.getElementById("btnConsumidor");
const volverLogin = document.getElementById("volverLogin");
const volverRol = document.getElementById("volverRol");

const nombreCliente = document.getElementById("nombreCliente");
const correoCliente = document.getElementById("correoCliente");
const telefonoCliente = document.getElementById("telefonoCliente");
const passwordCliente = document.getElementById("passwordCliente");

const btnGuardarCuenta = document.getElementById("btnGuardarCuenta");

const errorNombre = document.getElementById("errorNombre");
const errorCorreo = document.getElementById("errorCorreo");
const errorTelefono = document.getElementById("errorTelefono");
const errorPassword = document.getElementById("errorPassword");

const mensajeExito = document.getElementById("mensajeExito");
const mensajeSugerencia = document.getElementById("mensajeSugerencia");

function mostrarPantalla(pantalla) {
    pantallaLogin.classList.remove("activa");
    pantallaRol.classList.remove("activa");
    pantallaRegistro.classList.remove("activa");

    pantalla.classList.add("activa");
}

btnCrearCuenta.addEventListener("click", function () {
    mostrarPantalla(pantallaRol);
});

btnConsumidor.addEventListener("click", function () {
    mostrarPantalla(pantallaRegistro);
});

volverLogin.addEventListener("click", function () {
    mostrarPantalla(pantallaLogin);
});

volverRol.addEventListener("click", function () {
    mostrarPantalla(pantallaRol);
});

/* validación de correo */
function validarCorreo(correo) {
    const expresionCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return expresionCorreo.test(correo);
}

/* limpiar mensajes */
function limpiarMensajes() {
    errorNombre.textContent = "";
    errorCorreo.textContent = "";
    errorTelefono.textContent = "";
    errorPassword.textContent = "";
    mensajeExito.textContent = "";
    mensajeSugerencia.textContent = "";
}

/* obtener clientes registrados */
function obtenerClientesRegistrados() {
    const clientes = localStorage.getItem("clientesRegistrados");

    if (clientes === null) {
        return [];
    }

    return JSON.parse(clientes);
}

/* guardar cuenta */
btnGuardarCuenta.addEventListener("click", function () {
    limpiarMensajes();

    const nombre = nombreCliente.value.trim();
    const correo = correoCliente.value.trim().toLowerCase();
    const telefono = telefonoCliente.value.trim();
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

    if (password === "") {
        errorPassword.textContent = "Ingrese una contraseña";
        formularioValido = false;
    }

    if (!formularioValido) {
        return;
    }

    const clientesRegistrados = obtenerClientesRegistrados();

    const correoExiste = clientesRegistrados.some(function (cliente) {
        return cliente.correo === correo;
    });

    if (correoExiste) {
        errorCorreo.textContent = "Este correo ya está en uso";
        mensajeSugerencia.textContent = "Ya tienes una cuenta registrada. Puedes iniciar sesión.";
        return;
    }

    const nuevoCliente = {
        nombre: nombre,
        correo: correo,
        telefono: telefono,
        password: password
    };

    clientesRegistrados.push(nuevoCliente);

    localStorage.setItem("clientesRegistrados", JSON.stringify(clientesRegistrados));

    mensajeExito.textContent = "Cuenta creada correctamente. Tus datos de entrega y pago se guardarán para futuras compras.";

    nombreCliente.value = "";
    correoCliente.value = "";
    telefonoCliente.value = "";
    passwordCliente.value = "";
});