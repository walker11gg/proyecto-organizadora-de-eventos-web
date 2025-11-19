from flask import Flask, request, jsonify, render_template # para crear la app web y manejar solicitudes
from flask_cors import CORS
import json # para manejar datos en formato JSON (base de datos)
import os # para manejar rutas de archivos interactuando con el sistema operativo
import bcrypt # para hashear contraseñas
import random # para generar IDs únicos
import uuid # para generar IDs únicos

app = Flask(__name__)
CORS(app) # habilitar CORS para todas las rutas

#===RUTA DEL ARCHIVO JSON ===#
DB_PATH = os.path.join("data", "usuarios.json") #JSON USUARIOS
EVENTOS_PATH = os.path.join("data", "eventos.json") #JSON EVENTOS

#===RUTAS DE LA APLICACIÓN===#
#CARGA LAS RUTAS TOMANDOLAS DE LAS CARPETAS CORRESPONDIENTES
@app.route("/")
def login_page():
    return render_template("login.html")

@app.route("/registro")
def registro_page():
    return render_template("registro.html")

@app.route("/dashboard")
def dashboard_page():
    return render_template("dashboard.html")

@app.route("/mi_evento")
def mi_evento_page():
    return render_template("mi_evento.html")


#===FUNCIONES GENERALES DE USUARIOS===#
def cargar_datos():
    if not os.path.exists(DB_PATH):
        return {"usuarios": {}}

    with open(DB_PATH, "r", encoding="utf-8") as f:
        try:
            data = json.load(f)
            return data
        except json.JSONDecodeError:
            return {"usuarios": {}}

def guardar_datos(data):
    with open(DB_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=4, ensure_ascii=False)

def generar_id_unico(diccionario): #generar un id unico con uuid4 para que sea mas macizo
    while True:
        nuevo_id = str(uuid.uuid4())
        if nuevo_id not in diccionario:
            return nuevo_id

def hash_password(password):
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

def verificar_password(password, hash_guardado):
    return bcrypt.checkpw(password.encode("utf-8"), hash_guardado.encode("utf-8"))
#===============================#

#===FUNCIONES DE EVENTOS===#
def cargar_eventos():
    if not os.path.exists(EVENTOS_PATH):
        data = {"eventos": {}}
        with open(EVENTOS_PATH, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=4, ensure_ascii=False)
        return data

    with open(EVENTOS_PATH, "r", encoding="utf-8") as f:
        try:
            return json.load(f)
        except json.JSONDecodeError:
            return {"eventos": {}}

def guardar_eventos(data):
    with open(EVENTOS_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=4, ensure_ascii=False)

def crear_evento(cliente_id, nombre_cliente, email_cliente):
    return {
        "id": str(uuid.uuid4()),
        "cliente_id": cliente_id,
        "nombre_cliente": nombre_cliente,
        "email_cliente": email_cliente,

        "tipo_evento": "",
        "fecha": "",
        "ubicacion": "",
        "numero_invitados": 0,
        "disponibilidad": "Pendiente",

        "plan": "",
        "precio_total": 0,

        "servicios": {},
        "personalizacion": {},

        "descripcion": "",
        "estado_general": "Sin iniciar",

        "cotizacion": {},
        "factura": {
            "id": "",
            "estado": "Sin pagar",
            "monto_pagado": 0,
            "monto_pendiente": 0
        },

        "pagos": [],
        "proveedores": [],
        "comentarios": [],
        "retroalimentacion": {},

        "cronograma": []
    }
#=======================#

#===APIS CON LAS FUNCIONES===#
#===API DE REGISTRO Y LOGIN DE USUARIOS===#
@app.route("/api/registro", methods=["POST"])
def registro():
    data = cargar_datos()
    usuarios = data["usuarios"]

    info = request.get_json()
    nombre = info.get("nombre")
    email = info.get("email")
    password = info.get("password")
    rol = info.get("rol", "cliente")

    if not nombre or not email or not password:
        return jsonify({"ok": False, "mensaje": "Faltan datos obligatorios"}), 400

    # email repetido
    for u in usuarios.values():
        if u["email"].lower() == email.lower():
            return jsonify({"ok": False, "mensaje": "El email ya está registrado"}), 409

    nuevo_id = generar_id_unico(usuarios)

    usuarios[nuevo_id] = {
        "id": nuevo_id,
        "nombre": nombre,
        "email": email,
        "password": hash_password(password),
        "rol": rol,
        "activo": True
    }

    guardar_datos(data)

    return jsonify({"ok": True, "mensaje": "Usuario creado correctamente", "id": nuevo_id}), 201

@app.route("/api/login", methods=["POST"])
def login():
    data = cargar_datos()
    usuarios = data["usuarios"]

    info = request.get_json()
    email = info.get("email")
    password = info.get("password")

    # Buscar por email
    for user_id, usuario in usuarios.items():
        if usuario["email"].lower() == email.lower():

            if not usuario["activo"]:
                return jsonify({"ok": False, "mensaje": "Usuario inactivo"}), 403

            if verificar_password(password, usuario["password"]):
                return jsonify({
                    "ok": True,
                    "mensaje": "Login correcto",
                    "usuario": {
                        "id": usuario["id"],
                        "nombre": usuario["nombre"],
                        "rol": usuario["rol"],
                        "email":usuario["email"]
                    }
                })

            return jsonify({"ok": False, "mensaje": "Contraseña incorrecta"}), 401

    return jsonify({"ok": False, "mensaje": "Usuario no encontrado"}), 404
#===========================#

#===API CREACION DE EVENTOS===#

@app.route("/api/eventos", methods=["POST"])
def crear_evento_api():
    data = cargar_eventos()
    eventos = data["eventos"]

    info = request.get_json()

    cliente_id = info.get("cliente_id")
    nombre_cliente = info.get("nombre_cliente")
    email_cliente = info.get("email_cliente")

    # Validar datos mínimos
    if not cliente_id or not nombre_cliente or not email_cliente:
        return jsonify({"ok": False, "mensaje": "Faltan datos obligatorios"}), 400

    # Crear el evento en base a la plantilla
    nuevo_evento = crear_evento(cliente_id, nombre_cliente, email_cliente)

    # Guardar evento
    eventos[nuevo_evento["id"]] = nuevo_evento
    guardar_eventos(data)

    return jsonify({
        "ok": True,
        "mensaje": "Evento creado correctamente",
        "evento": nuevo_evento
    }), 201

@app.route("/api/eventos/cliente/<cliente_id>", methods=["GET"])
def eventos_por_cliente(cliente_id):
    data = cargar_eventos()
    eventos = data.get("eventos", {})

    # Filtrar eventos del cliente
    eventos_cliente = {
        eid: e for eid, e in eventos.items()
        if str(e.get("cliente_id")) == str(cliente_id)
    }

    return jsonify({"ok": True, "eventos": eventos_cliente})

@app.route("/api/eventos/<evento_id>", methods=["GET"])
def obtener_evento(evento_id):
    data = cargar_eventos()
    evento = data["eventos"].get(evento_id)

    if not evento:
        return jsonify({"ok": False, "mensaje": "Evento no encontrado"}), 404

    return jsonify({"ok": True, "evento": evento})

@app.route("/api/eventos/<evento_id>", methods=["PUT"])
def actualizar_evento(evento_id):
    data = cargar_eventos()
    eventos = data["eventos"]

    if evento_id not in eventos:
        return jsonify({"ok": False, "mensaje": "Evento no existe"}), 404

    info = request.get_json()

    # Actualizar solo los campos que vienen
    evento = eventos[evento_id]

    for key, value in info.items():
        evento[key] = value

    guardar_eventos(data)

    return jsonify({"ok": True, "mensaje": "Evento actualizado"})
#===========================#

if __name__ == "__main__":
    app.run(debug=True)