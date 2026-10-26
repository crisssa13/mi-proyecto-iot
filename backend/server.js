const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Estado global del sistema IoT
let sistemaEstado = {
    modo: "manual",       // "manual" o "automatico"
    distancia: 0,         // Distancia medida por el sensor en cm
    motorEstado: "detenido" // "izquierda", "derecha", "detenido"
};

// ENDPOINT 1: Obtener el estado actual (usado por la web y el Arduino)
app.get('/api/estado', (req, res) => {
    res.json(sistemaEstado);
});

// ENDPOINT 2: Actualizar comandos desde la Interfaz Web
app.post('/api/comando', (req, res) => {
    const { modo, motorEstado } = req.body;
    
    if (modo) sistemaEstado.modo = modo;
    
    // Si está en modo manual, la web controla el motor directamente
    if (sistemaEstado.modo === "manual" && motorEstado) {
        sistemaEstado.motorEstado = motorEstado;
    }
    
    res.json({ status: "success", estado: sistemaEstado });
});

// ENDPOINT 3: Actualizar datos desde el Arduino (Distancia y motor en Auto)
app.post('/api/arduino', (req, res) => {
    const { distancia, motorEstado } = req.body;
    
    if (distancia !== undefined) sistemaEstado.distancia = Number(distancia);
    
    // Si está en modo automático, el Arduino decide el giro del motor y lo reporta aquí
    if (sistemaEstado.modo === "automatico" && motorEstado) {
        sistemaEstado.motorEstado = motorEstado;
    }
    
    res.json({ status: "success", modo: sistemaEstado.modo, motorManual: sistemaEstado.motorEstado });
});

app.listen(PORT, () => {
    console.log(`API REST corriendo en el puerto ${PORT}`);
});
