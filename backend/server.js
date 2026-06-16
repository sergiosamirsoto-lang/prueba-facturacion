const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const { GoogleGenerativeAI } = require("@google/generative-ai");
dotenv.config({ path: path.join(__dirname, ".env") });

const app = express();

app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5500",
    methods: ["GET", "POST", "PUT", "DELETE"]
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Endpoint para el asistente virtual de IA (Gemini)
app.post("/api/chat", async (req, res) => {
    try {
        const { message } = req.body;
        const apiKey = process.env.GEMINI_API_KEY;
        
        if (!apiKey) {
             return res.json({ reply: "El asistente de IA no está activado. Añade GEMINI_API_KEY en tu archivo .env." });
        }
        
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        
        const promptContext = `Eres el asistente virtual inteligente de PVC Solutions HN.
        Tu trabajo es ayudar a los vendedores a usar este sistema de inventario, facturas y cotizaciones.
        - El sistema tiene una pestaña "Facturas" donde suben recibos/imágenes con estados (pendiente, enviada, rechazada).
        - Tiene una pestaña "Cotizaciones" donde eligen de un catálogo de 35 productos (ej: Tablilla PVC, Cornisa, Furring, etc), calculan total y mandan por WhatsApp o PDF.
        - Todo requiere acceso con Supabase Auth (solo 5 vendedores autorizados).
        
        Responde a la siguiente pregunta del vendedor de forma concisa, útil y amigable (máximo 3-4 oraciones cortas si es posible).
        
        Pregunta del vendedor: ${message}`;

        const result = await model.generateContent(promptContext);
        res.json({ reply: result.response.text() });
        
    } catch (error) {
        console.error("Error AI:", error);
        res.status(500).json({ reply: "Disculpa, tengo un problema de conexión temporal. Intenta en un momento." });
    }
});
app.use(express.static(path.join(__dirname, "..", "frontend")));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "frontend", "index.html"));
});

app.use((err, req, res, next) => {
    console.error("Error:", err.message);
    res.status(500).json({ mensaje: "Error interno del servidor" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor PVC SOLUTIONS corriendo en puerto ${PORT}`);
});
