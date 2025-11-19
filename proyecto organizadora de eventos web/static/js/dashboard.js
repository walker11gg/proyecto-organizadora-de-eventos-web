document.addEventListener("DOMContentLoaded", async function () {

  document.getElementById("btnAgregar").addEventListener("click", crearEvento);

  const mensajeEl = document.getElementById("mensaje");
  const usuarioStr = localStorage.getItem("usuario");

  if (!usuarioStr) {
    mensajeEl.textContent = "No se encontró sesión. Inicia sesión primero.";
    return;
  }

  let usuario;
  try {
    usuario = JSON.parse(usuarioStr);
  } catch (e) {
    mensajeEl.textContent = "Error leyendo información del usuario.";
    return;
  }

  const clienteId = usuario.id;
  mensajeEl.textContent = "Cargando eventos...";

  try {
    const res = await fetch(`/api/eventos/cliente/${encodeURIComponent(clienteId)}`);
    if (!res.ok) {
      mensajeEl.textContent = "Error al cargar eventos.";
      return;
    }

    const data = await res.json();

    if (!data.ok || !data.eventos) {
      mensajeEl.textContent = "No tiene eventos aún. Usa 'Agregar evento'.";
      initCalendar([]);
      return;
    }

    const eventosObj = data.eventos;
    const eventosArray = Object.values(eventosObj);

    const fcEvents = eventosArray.map(ev => ({
      id: ev.id,
      title: ev.tipo_evento ? `${ev.tipo_evento} — ${ev.plan || ""}`.trim() : (ev.nombre_cliente || "Evento"),
      start: ev.fecha || null,
      extendedProps: {
        cliente_id: ev.cliente_id,
        estado: ev.estado_general,
        precio_total: ev.precio_total,
        ubicacion: ev.ubicacion,
        descripcion: ev.descripcion
      }
    }));

    mensajeEl.textContent = "";
    initCalendar(fcEvents);

  } catch (err) {
    console.error(err);
    mensajeEl.textContent = "Error de conexión con el servidor.";
    initCalendar([]);
  }

  // ====== CARGAR SIDEBAR ======
  cargarSidebarInfo();
});


// ==========================================================
// Crear evento vacío
async function crearEvento() {
  const usuario = JSON.parse(localStorage.getItem("usuario"));
  if (!usuario) {
    alert("Debes iniciar sesión.");
    return;
  }

  const nuevoEvento = {
    cliente_id: usuario.id,
    nombre_cliente: usuario.nombre,
    email_cliente: usuario.email
  };

  try {
    const res = await fetch("/api/eventos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nuevoEvento)
    });

    const data = await res.json();

    if (data.ok) {
      localStorage.setItem("evento_actual_id", data.evento.id);
      window.location.href = "/mi_evento";
    } else {
      alert("Error creando evento: " + data.mensaje);
    }

  } catch (err) {
    console.error(err);
    alert("Error de conexión.");
  }
}


// ==========================================================
// Calendario
function initCalendar(events) {
  const calendarEl = document.getElementById("calendar");

  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,listWeek'
    },
    events: events,
    eventClick: function(info) {
      localStorage.setItem("evento_actual_id", info.event.id);
      window.location.href = `/mi_evento`;
    }
  });

  calendar.render();
}


// ==========================================================
// SIDEBAR LATERAL
const sidebar = document.getElementById("sidebar");
const btnSidebar = document.getElementById("btnSidebar");
const btnCerrar = document.getElementById("cerrarSidebar");

btnSidebar.addEventListener("click", () => {
  sidebar.classList.add("open");
});

btnCerrar.addEventListener("click", () => {
  sidebar.classList.remove("open");
});

function cargarSidebarInfo() {
  const usuarioStr = localStorage.getItem("usuario");
  if (!usuarioStr) return;

  const u = JSON.parse(usuarioStr);

  document.getElementById("sb_nombre").textContent = u.nombre;
  document.getElementById("sb_email").textContent = u.email;
  document.getElementById("sb_id").textContent = u.id;
  document.getElementById("sb_rol").textContent = u.rol;
  document.getElementById("sb_estado").textContent = "Activo";
}
