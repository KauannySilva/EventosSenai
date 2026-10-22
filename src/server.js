
require('dotenv').config();

const express = require('express');
const cors = require('cors');

const eventosRoutes = require('./routes/eventos');
const participantesRoutes = require('./routes/participantes');
const inscricoesRoutes = require('./routes/inscricoes');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.json({ mensagem: 'API EventoSENAI funcionando!' });
});

app.use('/eventos', eventosRoutes);
app.use('/participantes', participantesRoutes);
app.use('/inscricoes', inscricoesRoutes);

const PORT = process.env.PORT || 3333;

app.listen(PORT, async () => {
    console.log(`API rodando em http://localhost:${PORT}`);

    try {
        const db = require('./db');
        await db.query('SELECT 1');
        console.log('Conexão com MySQL realizada com sucesso!');
    } catch (error) {
        console.error('Erro ao conectar ao MySQL:', error.message);
    }
});
