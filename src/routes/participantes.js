
const express = require('express');
const db = require('../db');

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const [participantes] = await db.query(
            'SELECT id, nome, email FROM participantes ORDER BY nome'
        );

        res.json(participantes);
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao buscar participantes.' });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const [participantes] = await db.query(
            'SELECT id, nome, email FROM participantes WHERE id = ?',
            [req.params.id]
        );

        if (participantes.length === 0) {
            return res.status(404).json({ erro: 'Participante não encontrado.' });
        }

        res.json(participantes[0]);
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao buscar participante.' });
    }
});

router.post('/', async (req, res) => {
    try {
        const { nome, email } = req.body;

        if (!nome || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({ erro: 'Informe um nome e um e-mail válido.' });
        }

        const [resultado] = await db.query(
            'INSERT INTO participantes (nome, email) VALUES (?, ?)',
            [nome.trim(), email.trim()]
        );

        res.status(201).json({
            id: resultado.insertId,
            nome: nome.trim(),
            email: email.trim(),
            mensagem: 'Participante cadastrado com sucesso.'
        });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ erro: 'Este e-mail já está cadastrado.' });
        }

        res.status(500).json({ erro: 'Erro ao cadastrar participante.' });
    }
});

module.exports = router;
