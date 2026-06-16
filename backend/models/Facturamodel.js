const db = require("../config/db");

// 🧾 MODELO FACTURA
const Factura = {};

// 📤 CREAR FACTURA
Factura.crear = (data, callback) => {
    const sql = `
        INSERT INTO facturas (cliente, telefono, archivo, estado)
        VALUES (?, ?, ?, ?)
    `;

    db.query(
        sql,
        [data.cliente, data.telefono, data.archivo, data.estado],
        callback
    );
};


// 📥 OBTENER TODAS LAS FACTURAS
Factura.obtenerTodas = (callback) => {
    const sql = "SELECT * FROM facturas ORDER BY id DESC";
    db.query(sql, callback);
};


// ❌ ELIMINAR FACTURA
Factura.eliminar = (id, callback) => {
    const sql = "DELETE FROM facturas WHERE id = ?";
    db.query(sql, [id], callback);
};


// 🔁 CAMBIAR ESTADO
Factura.cambiarEstado = (id, estado, callback) => {
    const sql = `
        UPDATE facturas 
        SET estado = ? 
        WHERE id = ?
    `;

    db.query(sql, [estado, id], callback);
};


// 📦 EXPORTAR MODELO
module.exports = Factura;