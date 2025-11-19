document.getElementById("loginForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const mensaje = document.getElementById("mensaje");
    const boton = this.querySelector("button");

    mensaje.textContent = "Validando...";
    mensaje.style.color = "black";
    boton.disabled = true;

    try {
        const response = await fetch("/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        const result = await response.json();

        if (result.ok) {
            // Guardar usuario en localStorage
            localStorage.setItem("usuario", JSON.stringify(result.usuario));

            mensaje.textContent = "Login correcto. Redirigiendo...";
            mensaje.style.color = "green";

            setTimeout(() => {
                window.location.href = "/dashboard";
            }, 1000);
        } else {
            mensaje.textContent = result.mensaje;
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
