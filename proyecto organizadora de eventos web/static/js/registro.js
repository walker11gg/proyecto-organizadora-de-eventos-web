document.getElementById("registroForm").addEventListener("submit", async function(e) {
    e.preventDefault();

    const nombre = document.getElementById("nombre").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const rol = document.getElementById("rol").value;
    
    const mensaje = document.getElementById("mensaje");
    const boton = this.querySelector("button");

    // Limpieza de mensaje
    mensaje.textContent = "";
    
    // Validación mínima
    if (!nombre || !email || !password) {
        mensaje.textContent = "Por favor completa todos los campos";
        mensaje.style.color = "red";
        return;
    }

    // Bloquear botón
    boton.disabled = true;
    mensaje.textContent = "Procesando...";
    mensaje.style.color = "black";

    try {
        const response = await fetch("/api/registro", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nombre, email, password, rol })
        });

        const result = await response.json();

        if (result.ok) {

            // Guardar datos esenciales (opcional)
            localStorage.setItem("usuario", JSON.stringify({
                id: result.id,
                nombre: nombre,
                rol: rol
            }));

            mensaje.textContent = "Registro exitoso. Redirigiendo...";
            mensaje.style.color = "green";

            setTimeout(() => {
                window.location.href = "/";
            }, 1200);

        } else {
            mensaje.textContent = result.mensaje || "No se pudo registrar.";
            mensaje.style.color = "red";
            boton.disabled = false;
        }

    } catch (error) {
        console.error(error);
        mensaje.textContent = "Error en la conexión con el servidor";
        mensaje.style.color = "red";
        boton.disabled = false;
    }
});
