//https://emqlgfmibvxdyipxubul.supabase.co/rest/v1/
const SUPABASE_URL = "https://emqlgfmibvxdyipxubul.supabase.co"; 
const SUPABASE_ANON_KEY = "sb_publishable_sdiAONM5AeOf56mRe78fiw_YkP3uN46"; 

let supabaseClient = null;

//validacion de libreria
if (typeof supabase !== 'undefined') {
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
} else {
    console.warn("Librería de Supabase no detectada. Las consultas a Supabase serán omitidas.");
}

// ==========================================
// VARIABLES GLOBALES
// ==========================================

let apiKeyInput, chatInput, chatResponseArea;

// ==========================================
// CARGA Y CONFIGURACIÓN DE EVENTOS
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    apiKeyInput = document.getElementById('openai-key');
    chatInput = document.getElementById('chat-message');
    chatResponseArea = document.getElementById('chat-responses');
    
    const btnGenerarImagen = document.getElementById('btn-generar-imagen');
    const btnEnviar = document.querySelector('button[onclick="enviarConsultaIA()"]');

    if (apiKeyInput) {
        const savedKey = localStorage.getItem('user_openai_key');
        if (savedKey) apiKeyInput.value = savedKey;

        apiKeyInput.addEventListener('input', guardarApiKey);
    }

    if (btnEnviar) {
        btnEnviar.removeAttribute('onclick');
        btnEnviar.addEventListener('click', enviarConsultaIA);
    }

    if (btnGenerarImagen) {
        btnGenerarImagen.addEventListener('click', generarImagenIA);
    }

    if (chatInput) {
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                enviarConsultaIA();
            }
        });
    }
});

// ==========================================
// FUNCIONES DE LÓGICA
// ==========================================

function guardarApiKey() {
    const key = apiKeyInput.value.trim();

    if (key.startsWith('sk-')) {
        localStorage.setItem('user_openai_key', key);
        console.log('API Key guardada localmente.');
    } else if (key === '') {
        localStorage.removeItem('user_openai_key');
    }
}

// ==========================================
// FUNCIÓN PARA OBTENER DATOS DE SUPABASE
// ==========================================

async function obtenerContextoBD() {
    const usuarioActivo = JSON.parse(localStorage.getItem("usuarioActivo"));

    const contexto = {
        usuarioActivo: usuarioActivo || null,
        restaurante: null,
        usuarios: []
    };

    if (!supabaseClient || !usuarioActivo) {
        return contexto;
    }

    try {
        const { data: restaurante, error: errorRestaurante } = await supabaseClient
            .from("restaurantes")
            .select("*")
            .eq("usuario_id", usuarioActivo.id)
            .maybeSingle();

        if (errorRestaurante) {
            console.error("Error al obtener restaurante:", errorRestaurante);
        } else {
            contexto.restaurante = restaurante;
        }

    } catch (error) {
        console.error("Error consultando Supabase:", error);
    }

    return contexto;
}

async function construirPromptImagenNegocio(promptUsuario) {
    const contexto = await obtenerContextoBD();

    return `
Crea una imagen profesional para el negocio gastronómico del usuario.

Solicitud del usuario:
${promptUsuario}

Usuario actual:
${JSON.stringify(contexto.usuarioActivo, null, 2)}

Restaurante del usuario:
${JSON.stringify(contexto.restaurante, null, 2)}

Reglas:
- Si pide un plato, genera una imagen realista del plato.
- Si pide un gráfico, genera un dashboard visual con estadísticas.
- Si pide ventas, ingresos, costos o ganancias, representa la situación económica del negocio.
- La imagen debe estar relacionada solo con su restaurante.
- No uses datos de otros restaurantes.
- No incluyas contraseñas ni información sensible.
- Estilo profesional, limpio y útil para menú, publicidad o gestión del negocio.
- Sin marcas comerciales.
`;
}
// ==========================================
// FUNCIÓN PARA ENVIAR CONSULTA A GPT
// ==========================================

async function enviarConsultaIA(event) {
    if (event) event.preventDefault();

    const mensajeUsuario = chatInput.value.trim();
    const apiKey = localStorage.getItem('user_openai_key');

    if (!apiKey) {
        alert('Por favor, ingresa tu API Key de OpenAI en la sección de configuración primero.');
        return;
    }

    if (!mensajeUsuario) return;

    try {
        if (chatResponseArea.innerHTML.includes("Configura tu API Key en el cuadro superior")) {
            chatResponseArea.innerHTML = "";
        }

        chatResponseArea.innerHTML += `<p><b>Tú:</b> ${mensajeUsuario}</p>`;
        chatResponseArea.innerHTML += `<p id="loading"><i>Pensando...</i></p>`;
        chatInput.value = '';
        chatResponseArea.scrollTop = chatResponseArea.scrollHeight;

        const contexto = await obtenerContextoBD();

       const promptConContexto = `
Eres el asistente privado de FoodFinder para un cocinero/emprendedor gastronómico.

Tu usuario actual es:
${JSON.stringify(contexto.usuarioActivo, null, 2)}

Información del restaurante del usuario actual:
${JSON.stringify(contexto.restaurante, null, 2)}

Reglas importantes:
- Responde como si hablaras directamente con el dueño del restaurante.
- Usa expresiones como "tu restaurante", "tu negocio", "tus datos".
- No respondas con información de otros restaurantes.
- No digas "restaurantes registrados" como si fuera una lista global, salvo que el usuario lo pida y tenga permiso.
- Si el usuario pregunta "¿qué restaurantes están registrados?", interpreta que se refiere a su propio restaurante.
- Si no existe restaurante asociado a este usuario, responde: "Todavía no tienes un restaurante registrado en tu cuenta".
- No inventes datos.
- No muestres contraseñas ni información sensible.
- Si falta información, indica claramente qué dato falta.

Consulta del usuario:
${mensajeUsuario}
`;

        const respuesta = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [
                    {
                        role: 'system',
                        content: 'Eres un asistente experto en gastronomía, usuarios, pedidos e inventarios.'
                    },
                    {
                        role: 'user',
                        content: promptConContexto
                    }
                ],
                temperature: 0.7
            })
        });

        const data = await respuesta.json();

        const loadingElement = document.getElementById('loading');
        if (loadingElement) loadingElement.remove();

        if (respuesta.ok) {
            const mensajeIA = data.choices[0].message.content;

            chatResponseArea.innerHTML += `
                <p><b>Asistente IA:</b> ${mensajeIA}</p>
                <hr style="border-top: 1px solid #E5E7EB; margin: 10px 0;">
            `;
        } else {
            chatResponseArea.innerHTML += `
                <p style="color: red;"><b>Error:</b> ${data.error.message}</p>
            `;
        }

        chatResponseArea.scrollTop = chatResponseArea.scrollHeight;

    } catch (error) {
        console.error('Error:', error);

        const loadingElement = document.getElementById('loading');
        if (loadingElement) loadingElement.remove();

        alert('Hubo un problema de conexión. Verifica tu internet o tu API Key.');
    }
}

// ==========================================
// FUNCIÓN PARA GENERAR IMÁGENES
// ==========================================

async function generarImagenIA(event) {
    if (event) event.preventDefault();

    const promptUsuario = chatInput.value.trim();
    const apiKey = localStorage.getItem('user_openai_key');

    if (!apiKey) {
        alert('Por favor, ingresa tu API Key de OpenAI en la sección de configuración primero.');
        return;
    }

    if (!promptUsuario) return;

    try {
        if (chatResponseArea.innerHTML.includes("Configura tu API Key en el cuadro superior")) {
            chatResponseArea.innerHTML = "";
        }

        chatResponseArea.innerHTML += `<p><b>Tú (Solicitud de imagen):</b> ${promptUsuario}</p>`;
        chatResponseArea.innerHTML += `<p id="loading"><i>Generando imagen... Esto puede tomar unos segundos.</i></p>`;
        chatInput.value = "";
        chatResponseArea.scrollTop = chatResponseArea.scrollHeight;

        const promptFinal = await construirPromptImagenNegocio(promptUsuario);

        const respuesta = await fetch("https://api.openai.com/v1/images/generations", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "gpt-image-1",
                prompt: promptFinal,
                n: 1,
                size: "1024x1024"
            })
        });

        const data = await respuesta.json();
        console.log(data);

        const loadingElement = document.getElementById("loading");
        if (loadingElement) loadingElement.remove();

        if (!respuesta.ok) {
            chatResponseArea.innerHTML += `
                <p style="color: red;"><b>Error:</b> ${data.error?.message || "No se pudo generar la imagen."}</p>
            `;
            return;
        }

        const imagenBase64 = data.data[0].b64_json;
        const urlImagen = `data:image/png;base64,${imagenBase64}`;

        chatResponseArea.innerHTML += `
            <p><b>Asistente IA:</b> Imagen generada según tu negocio:</p>
            <div class="imagen_ia_contenedor">
                <img src="${urlImagen}" class="imagen_ia_preview" alt="Imagen generada por IA">
            </div>
            <hr style="border-top: 1px solid #E5E7EB; margin: 10px 0;">
        `;

        chatResponseArea.scrollTop = chatResponseArea.scrollHeight;

    } catch (error) {
        console.error("Error:", error);

        const loadingElement = document.getElementById("loading");
        if (loadingElement) loadingElement.remove();

        alert("Hubo un problema al generar la imagen. Revisa la consola.");
    }
}

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