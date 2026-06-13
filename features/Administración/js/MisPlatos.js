document.addEventListener("DOMContentLoaded", function () {
    const fondoCard = document.querySelector(".fondo_card");
    const btnAgregar = document.getElementById("btn_Agregar");
    const contenedorPlatos = document.getElementById("contenedor-platos");

    const btnSubmitPlato = document.querySelector('.datos_plato button[type="submit"]');
    const btnCancelar = document.querySelector('.datos_plato button[type="cancelar"]');

    const inputNombre = document.getElementById("nombre");
    const inputPrecio = document.getElementById("Precio");
    const inputStock = document.getElementById("Stock");
    const inputDescripcion = document.getElementById("Descripcion");
    const inputFoto = document.getElementById("foto-plato");
    const plusIcon = document.getElementById("plus-icon");

    let filaEditando = null;

    fondoCard.style.display = "none";

    function guardarLocalStorage() {
        const platos = [];

        document.querySelectorAll("#contenedor-platos tr").forEach(function (fila) {
            platos.push({
                nombre: fila.children[0].textContent,
                precio: fila.children[1].textContent.replace("S/ ", ""),
                stock: fila.children[2].textContent,
                descripcion: fila.dataset.descripcion || "",
                pedidos: fila.children[4].textContent
            });
        });

        localStorage.setItem("platos", JSON.stringify(platos));
    }

    function cargarLocalStorage() {
        const platos = JSON.parse(localStorage.getItem("platos")) || [];

        platos.forEach(function (plato) {
            const nuevaFila = document.createElement("tr");
            nuevaFila.dataset.descripcion = plato.descripcion;

            nuevaFila.innerHTML = `
                <td>${plato.nombre}</td>
                <td>S/ ${plato.precio}</td>
                <td>${plato.stock}</td>
                <td></td>
                <td>${plato.pedidos}</td>
                <td>
                    <div class="acciones-celda">
                        <button class="btn-editar">✏️ Editar</button>
                        <button class="btn-eliminar">🗑️</button>
                    </div>
                </td>
            `;

            actualizarEstado(nuevaFila.children[3], parseInt(plato.stock));
            contenedorPlatos.appendChild(nuevaFila);
        });
    }

    function limpiarFormulario() {
        inputNombre.value = "";
        inputPrecio.value = "";
        inputStock.value = "";
        inputDescripcion.value = "";
        inputFoto.value = "";

        inputNombre.classList.remove("campo-error");
        inputPrecio.classList.remove("campo-error");
        inputStock.classList.remove("campo-error");
        inputDescripcion.classList.remove("campo-error");
        plusIcon.classList.remove("campo-error");

        filaEditando = null;
        btnSubmitPlato.textContent = "Añadir";
    }

    function actualizarEstado(tdEstado, stockNumero) {
        tdEstado.innerHTML = "";

        const spanEstado = document.createElement("span");
        spanEstado.classList.add("badge");

        if (stockNumero <= 0) {
            spanEstado.classList.add("sin-stock");
            spanEstado.textContent = "Sin stock";
        } else {
            spanEstado.classList.add("con-stock");
            spanEstado.textContent = "Con stock";
        }

        tdEstado.appendChild(spanEstado);
    }

    cargarLocalStorage();

    btnAgregar.addEventListener("click", function () {
        limpiarFormulario();
        fondoCard.style.display = "flex";
    });

    btnCancelar.addEventListener("click", function (event) {
        event.preventDefault();
        fondoCard.style.display = "none";
        limpiarFormulario();
    });

    [inputNombre, inputPrecio, inputStock, inputDescripcion].forEach(function (input) {
        input.addEventListener("input", function () {
            input.classList.remove("campo-error");
        });
    });

    inputFoto.addEventListener("change", function () {
        plusIcon.classList.remove("campo-error");

        if (inputFoto.files.length > 0) {
            const archivo = inputFoto.files[0];

            if (archivo.type !== "image/png") {
                plusIcon.classList.add("campo-error");
                alert("Solo se admiten imágenes PNG");
                inputFoto.value = "";
            }
        }
    });

    btnSubmitPlato.addEventListener("click", function (event) {
        event.preventDefault();

        const nombre = inputNombre.value.trim();
        const precio = inputPrecio.value.trim();
        const stock = inputStock.value.trim();
        const descripcion = inputDescripcion.value.trim();

        inputNombre.classList.remove("campo-error");
        inputPrecio.classList.remove("campo-error");
        inputStock.classList.remove("campo-error");
        inputDescripcion.classList.remove("campo-error");
        plusIcon.classList.remove("campo-error");

        let formularioValido = true;

        if (nombre === "") {
            inputNombre.classList.add("campo-error");
            formularioValido = false;
        }

        if (precio === "") {
            inputPrecio.classList.add("campo-error");
            formularioValido = false;
        }

        if (stock === "") {
            inputStock.classList.add("campo-error");
            formularioValido = false;
        }

        if (descripcion === "") {
            inputDescripcion.classList.add("campo-error");
            formularioValido = false;
        }

        if (filaEditando === null) {
            if (inputFoto.files.length === 0) {
                plusIcon.classList.add("campo-error");
                formularioValido = false;
            }
        }

        if (inputFoto.files.length > 0) {
            const archivo = inputFoto.files[0];

            if (archivo.type !== "image/png") {
                plusIcon.classList.add("campo-error");
                alert("Solo se admiten imágenes PNG");
                formularioValido = false;
            }
        }

        if (!formularioValido) {
            alert("Por favor, complete correctamente todos los campos.");
            return;
        }

        const stockNumero = parseInt(stock);

        if (filaEditando !== null) {
            const celdas = filaEditando.children;

            celdas[0].textContent = nombre;
            celdas[1].textContent = "S/ " + precio;
            celdas[2].textContent = stockNumero;

            actualizarEstado(celdas[3], stockNumero);

            filaEditando.dataset.descripcion = descripcion;

            guardarLocalStorage();

            fondoCard.style.display = "none";
            limpiarFormulario();
            return;
        }

        const nuevaFila = document.createElement("tr");
        nuevaFila.dataset.descripcion = descripcion;

        nuevaFila.innerHTML = `
            <td>${nombre}</td>
            <td>S/ ${precio}</td>
            <td>${stockNumero}</td>
            <td></td>
            <td>0</td>
            <td>
                <div class="acciones-celda">
                    <button class="btn-editar">✏️ Editar</button>
                    <button class="btn-eliminar">🗑️</button>
                </div>
            </td>
        `;

        actualizarEstado(nuevaFila.children[3], stockNumero);

        contenedorPlatos.appendChild(nuevaFila);

        guardarLocalStorage();

        fondoCard.style.display = "none";
        limpiarFormulario();
    });

    contenedorPlatos.addEventListener("click", function (event) {
        if (event.target.classList.contains("btn-eliminar")) {
            const fila = event.target.closest("tr");
            fila.remove();
            guardarLocalStorage();
        }

        if (event.target.classList.contains("btn-editar")) {
            filaEditando = event.target.closest("tr");

            const celdas = filaEditando.children;

            inputNombre.value = celdas[0].textContent;
            inputPrecio.value = celdas[1].textContent.replace("S/ ", "");
            inputStock.value = celdas[2].textContent;
            inputDescripcion.value = filaEditando.dataset.descripcion || "";

            inputFoto.value = "";
            btnSubmitPlato.textContent = "Guardar";

            fondoCard.style.display = "flex";
        }
    });
});