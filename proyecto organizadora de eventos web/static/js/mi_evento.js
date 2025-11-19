document.addEventListener("DOMContentLoaded", async () => {

    const idEvento = localStorage.getItem("evento_actual_id");
    const mensaje = document.getElementById("mensaje");

    if (!idEvento) {
        mensaje.textContent = "No se encontró evento seleccionado.";
        mensaje.style.color = "red";
        return;
    }

    // Cargar datos del evento
    try {
        const res = await fetch(`/api/eventos/${idEvento}`);
        const data = await res.json();

        if (!data.ok) {
            mensaje.textContent = "Error cargando evento.";
            return;
        }

        const ev = data.evento;

        document.getElementById("tipo_evento").value = ev.tipo_evento || "";
        document.getElementById("fecha").value = ev.fecha || "";
        document.getElementById("ubicacion").value = ev.ubicacion || "";
        document.getElementById("invitados").value = ev.numero_invitados || "";
        document.getElementById("plan").value = ev.plan || "";
        document.getElementById("descripcion").value = ev.descripcion || "";

    } catch (err) {
        console.error(err);
        mensaje.textContent = "Error al conectar con el servidor.";
    }

    // Guardar cambios
    document.getElementById("eventoForm").addEventListener("submit", async e => {
        e.preventDefault();

        const cuerpo = {
            tipo_evento: document.getElementById("tipo_evento").value,
            fecha: document.getElementById("fecha").value,
            ubicacion: document.getElementById("ubicacion").value,
            numero_invitados: document.getElementById("invitados").value,
            plan: document.getElementById("plan").value,
            descripcion: document.getElementById("descripcion").value
        };

        try {
            const res = await fetch(`/api/eventos/${idEvento}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(cuerpo)
            });

            const result = await res.json();

            if (result.ok) {
                mensaje.textContent = "Cambios guardados correctamente.";
                mensaje.style.color = "green";
            } else {
                mensaje.textContent = result.mensaje;
                mensaje.style.color = "red";
            }

        } catch (err) {
            console.error(err);
            mensaje.textContent = "Error guardando los cambios.";
        }
    });
    

});