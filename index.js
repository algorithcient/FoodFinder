document.addEventListener("DOMContentLoaded", function () {

    const btnComoFunciona = document.getElementById("btnComoFunciona");

    btnComoFunciona.addEventListener("click", function () {

        document.getElementById("como_funciona").scrollIntoView({
            behavior: "smooth"
        });

    });

});