const Tesseract = require("tesseract.js");

// 🤖 LEER TEXTO DESDE IMAGEN O PDF (convertido a imagen)
const leerFactura = async (filePath) => {
    try {
        const result = await Tesseract.recognize(
            filePath,
            "spa", // español
            {
                logger: m => console.log(m) // progreso OCR
            }
        );

        const texto = result.data.text;

        return {
            success: true,
            texto: texto
        };

    } catch (error) {
        console.error("Error OCR:", error);

        return {
            success: false,
            error: error.message
        };
    }
};


// 🧠 EXTRAER DATOS BÁSICOS DE FACTURA
const extraerDatosFactura = (texto) => {
    
    // ⚠️ esto es básico (luego se mejora con IA real)
    
    const totalMatch = texto.match(/total\s*[:\-]?\s*l?\s*([\d.,]+)/i);
    const clienteMatch = texto.match(/cliente\s*[:\-]?\s*(.+)/i);
    const fechaMatch = texto.match(/fecha\s*[:\-]?\s*(.+)/i);

    return {
        cliente: clienteMatch ? clienteMatch[1].trim() : "No detectado",
        total: totalMatch ? totalMatch[1] : "No detectado",
        fecha: fechaMatch ? fechaMatch[1].trim() : "No detectado",
        textoCompleto: texto
    };
};


// 📦 EXPORTAR
module.exports = {
    leerFactura,
    extraerDatosFactura
};