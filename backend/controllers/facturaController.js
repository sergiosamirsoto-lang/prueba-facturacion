const db = require("../config/db");

exports.crearFactura = (req, res) => {
    const { cliente, telefono, estado } = req.body;
    const archivo = req.file ? req.file.filename : null;

    if (!cliente || !telefono || !archivo) {
        return res.status(400).json({ mensaje: "Faltan datos obligatorios" });
    }

    const sql = `INSERT INTO facturas (cliente, telefono, archivo, estado) VALUES (?, ?, ?, ?)`;
    db.query(sql, [cliente, telefono, archivo, estado || "pendientes"], (err, result) => {
        if (err) {
            console.error("Error creando factura:", err);
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ mensaje: "Factura creada correctamente", id: result.insertId });
    });
};

exports.obtenerFacturas = (req, res) => {
    const sql = "SELECT * FROM facturas ORDER BY id DESC";
    db.query(sql, (err, rows) => {
        if (err) {
            console.error("Error obteniendo facturas:", err);
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
};

exports.eliminarFactura = (req, res) => {
    const { id } = req.params;
    const sql = "DELETE FROM facturas WHERE id = ?";
    db.query(sql, [id], (err) => {
        if (err) {
            console.error("Error eliminando factura:", err);
            return res.status(500).json({ error: err.message });
        }
        res.json({ mensaje: "Factura eliminada" });
    });
};

exports.cambiarEstado = (req, res) => {
    const { id } = req.params;
    const { estado } = req.body;
    if (!estado) {
        return res.status(400).json({ mensaje: "Estado requerido" });
    }
    const sql = "UPDATE facturas SET estado = ? WHERE id = ?";
    db.query(sql, [estado, id], (err) => {
        if (err) {
            console.error("Error actualizando estado:", err);
            return res.status(500).json({ error: err.message });
        }
        res.json({ mensaje: "Estado actualizado" });
    });
};
