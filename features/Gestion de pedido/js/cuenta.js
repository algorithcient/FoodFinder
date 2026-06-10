const pantallaLogin = document.getElementById("pantallaLogin");
const pantallaRol = document.getElementById("pantallaRol");
const pantallaRegistro = document.getElementById("pantallaRegistro");

const btnCrearCuenta = document.getElementById("btnCrearCuenta");
const btnConsumidor = document.getElementById("btnConsumidor");
const volverLogin = document.getElementById("volverLogin");
const volverRol = document.getElementById("volverRol");

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