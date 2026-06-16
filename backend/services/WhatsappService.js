const axios = require("axios");
require("dotenv").config();

// 💬 ENVIAR MENSAJE POR WHATSAPP
const enviarWhatsApp = async (telefono, mensaje) => {
    try {
        const url = `https://graph.facebook.com/v19.0/${process.env.WHATSAPP_PHONE_ID}/messages`;

        const data = {
            messaging_product: "whatsapp",
            to: telefono,
            type: "text",
            text: {
                body: mensaje
            }
        };

        const response = await axios.post(url, data, {
            headers: {
                Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
                "Content-Type": "application/json"
            }
        });

        console.log("📩 WhatsApp enviado:", response.data);

        return {
            success: true,
            data: response.data
        };

    } catch (error) {
        console.error("❌ Error WhatsApp:", error.response?.data || error.message);

        return {
            success: false,
            error: error.message
        };
    }
};


// 🧾 MENSAJE AUTOMÁTICO DE FACTURA
const enviarFactura = async (telefono, factura) => {

    const mensaje = `
📄 PVC SOLUTIONS HN
----------------------
👤 Cliente: ${factura.cliente}
💰 Estado: ${factura.estado}
📅 Fecha: ${factura.fecha}

📎 Archivo: ${factura.archivo}

Gracias por su compra 👍
`;

    return await enviarWhatsApp(telefono, mensaje);
};


// 📦 EXPORTAR
module.exports = {
    enviarWhatsApp,
    enviarFactura
};