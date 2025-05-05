const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

mongoose.connect(process.env.MONGODB_URI, { dbName: 'test' })
  .then(() => console.log('Conexión exitosa a MongoDB Atlas'))
  .catch((error) => console.error('Error al conectar a MongoDB:', error.message));

const Usuario = require('./models/usuarios');
const Envio = require('./models/envios');

app.get('/', (req, res) => {
  res.send('¡El servidor está funcionando!');
});

app.get('/usuarios', async (req, res) => {
  try {
    const usuarios = await Usuario.find();
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});

app.get('/creditos/:id', async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.params.id);
    if (!usuario) return res.status(404).send('Usuario no encontrado');
    res.json({ creditos: usuario.credito });
  } catch (error) {
    res.status(500).json({ error: 'Error al consultar créditos' });
  }
});

app.post('/envios', async (req, res) => {
  try {
    const { usuarioId, nombre, direccion, telefono, referencia, observacion, productos } = req.body;

    const usuario = await Usuario.findById(usuarioId);
    if (!usuario) return res.status(404).send('Usuario no encontrado');

    const pesoTotal = productos.reduce((sum, prod) => sum + prod.peso, 0);
    const multiplicador = Math.ceil(pesoTotal / 3);
    const costoEnvio = multiplicador;

    if (usuario.credito < costoEnvio) {
      return res.status(400).send('No tienes suficientes créditos para este envío');
    }

    usuario.credito -= costoEnvio;
    await usuario.save();

    const nuevoEnvio = new Envio({
      usuarioId,
      nombre,
      direccion,
      telefono,
      referencia,
      observacion,
      productos,
      costo: costoEnvio,
    });

    await nuevoEnvio.save();
    res.status(201).json(nuevoEnvio);

  } catch (error) {
    res.status(500).json({ error: 'Error al registrar el envío' });
  }
});

app.get('/envios', async (req, res) => {
  try {
    const envios = await Envio.find().populate('usuarioId', 'nombre');
    res.json(envios);
  } catch (error) {
    res.status(500).json({ error: 'No se pudieron obtener los envíos' });
  }
});

app.get('/envios/:usuarioId', async (req, res) => {
  try {
    const envios = await Envio.find({ usuarioId: req.params.usuarioId });
    res.json(envios);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los envíos del usuario' });
  }
});

app.delete('/envios/:id', async (req, res) => {
  try {
    const envio = await Envio.findById(req.params.id);
    if (!envio) return res.status(404).send('Envío no encontrado');

    const usuario = await Usuario.findById(envio.usuarioId);
    if (usuario) {
      usuario.credito += envio.costo;
      await usuario.save();
    }

    await envio.deleteOne();
    res.json({ mensaje: 'Envío eliminado y créditos devueltos' });

  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el envío' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo exitosamente`);
});