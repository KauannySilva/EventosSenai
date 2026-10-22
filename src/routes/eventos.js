
const express = require('express');
const db = require('../db');

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const { categoria_id } = req.query;

        let sql = `
            SELECT e.*, c.nome AS categoria,
            e.vagas - (
                SELECT COUNT(*)
                FROM inscricoes i
                WHERE i.evento_id = e.id
            ) AS vagas_disponiveis
            FROM eventos e
            LEFT JOIN categorias c ON c.id = e.categoria_id
        `;

        const params = [];

        if (categoria_id) {
            sql += ' WHERE e.categoria_id = ?';
            params.push(categoria_id);
        }

        sql += ' ORDER BY e.data_evento ASC';

        const [eventos] = await db.query(sql, params);
        res.json(eventos);
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao buscar eventos.' });
    }
});

router.get('/:id/inscritos', async (req, res) => {
    try {
        const [inscritos] = await db.query(
            `SELECT p.id, p.nome, p.email, i.data_inscricao
             FROM inscricoes i
             JOIN participantes p ON p.id = i.participante_id
             WHERE i.evento_id = ?
             ORDER BY i.data_inscricao DESC`,
            [req.params.id]
        );

        res.json(inscritos);
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao buscar inscritos.' });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const [eventos] = await db.query(
            `SELECT e.*, c.nome AS categoria,
             e.vagas - (
                SELECT COUNT(*)
                FROM inscricoes i
                WHERE i.evento_id = e.id
             ) AS vagas_disponiveis
             FROM eventos e
             LEFT JOIN categorias c ON c.id = e.categoria_id
             WHERE e.id = ?`,
            [req.params.id]
        );

        if (eventos.length === 0) {
            return res.status(404).json({ erro: 'Evento não encontrado.' });
        }

        res.json(eventos[0]);
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao buscar evento.' });
    }
});

router.post('/', async (req, res) => {
    try {
        const { titulo, descricao, data_evento, local, vagas, categoria_id } = req.body;

        if (!titulo || !data_evento || !local || !vagas || !categoria_id) {
            return res.status(400).json({ erro: 'Preencha os campos obrigatórios.' });
        }

        const [resultado] = await db.query(
            `INSERT INTO eventos
             (titulo, descricao, data_evento, local, vagas, categoria_id)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [titulo, descricao || null, data_evento, local, Number(vagas), Number(categoria_id)]
        );

        res.status(201).json({ id: resultado.insertId, mensagem: 'Evento cadastrado com sucesso.' });
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao cadastrar evento.' });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const { titulo, descricao, data_evento, local, vagas, categoria_id } = req.body;

        const [resultado] = await db.query(
            `UPDATE eventos
             SET titulo = ?, descricao = ?, data_evento = ?, local = ?, vagas = ?, categoria_id = ?
             WHERE id = ?`,
            [titulo, descricao || null, data_evento, local, Number(vagas), Number(categoria_id), req.params.id]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({ erro: 'Evento não encontrado.' });
        }

        res.json({ mensagem: 'Evento atualizado com sucesso.' });
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao atualizar evento.' });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const [resultado] = await db.query(
            'DELETE FROM eventos WHERE id = ?',
            [req.params.id]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({ erro: 'Evento não encontrado.' });
        }

        res.json({ mensagem: 'Evento excluído com sucesso.' });
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao excluir evento.' });
    }
});

module.exports = router;
