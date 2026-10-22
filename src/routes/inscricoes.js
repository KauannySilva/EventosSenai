
const express = require('express');
const db = require('../db');

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const [inscricoes] = await db.query(
            `SELECT i.id, i.evento_id, i.participante_id, i.data_inscricao,
                    e.titulo AS evento, p.nome AS participante, p.email
             FROM inscricoes i
             JOIN eventos e ON e.id = i.evento_id
             JOIN participantes p ON p.id = i.participante_id
             ORDER BY i.data_inscricao DESC`
        );

        res.json(inscricoes);
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao buscar inscrições.' });
    }
});

router.post('/', async (req, res) => {
    const { evento_id, participante_id } = req.body;
    let conexao;

    if (!evento_id || !participante_id) {
        return res.status(400).json({ erro: 'Selecione um evento e um participante.' });
    }

    try {
        conexao = await db.getConnection();
        await conexao.beginTransaction();

        const [eventos] = await conexao.query(
            'SELECT id, vagas FROM eventos WHERE id = ? FOR UPDATE',
            [evento_id]
        );

        if (eventos.length === 0) {
            await conexao.rollback();
            return res.status(404).json({ erro: 'Evento não encontrado.' });
        }

        const [participantes] = await conexao.query(
            'SELECT id FROM participantes WHERE id = ?',
            [participante_id]
        );

        if (participantes.length === 0) {
            await conexao.rollback();
            return res.status(404).json({ erro: 'Participante não encontrado.' });
        }

        const [existente] = await conexao.query(
            'SELECT id FROM inscricoes WHERE evento_id = ? AND participante_id = ?',
            [evento_id, participante_id]
        );

        if (existente.length > 0) {
            await conexao.rollback();
            return res.status(409).json({ erro: 'Este participante já está inscrito neste evento.' });
        }

        const [contagem] = await conexao.query(
            'SELECT COUNT(*) AS total FROM inscricoes WHERE evento_id = ?',
            [evento_id]
        );

        if (Number(contagem[0].total) >= Number(eventos[0].vagas)) {
            await conexao.rollback();
            return res.status(409).json({ erro: 'Não há vagas disponíveis neste evento.' });
        }

        const [resultado] = await conexao.query(
            'INSERT INTO inscricoes (evento_id, participante_id, data_inscricao) VALUES (?, ?, CURDATE())',
            [evento_id, participante_id]
        );

        await conexao.commit();

        res.status(201).json({
            id: resultado.insertId,
            mensagem: 'Inscrição realizada com sucesso.'
        });
    } catch (error) {
        if (conexao) {
            await conexao.rollback();
        }

        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ erro: 'Este participante já está inscrito neste evento.' });
        }

        res.status(500).json({ erro: 'Erro ao realizar inscrição.' });
    } finally {
        if (conexao) {
            conexao.release();
        }
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const [resultado] = await db.query(
            'DELETE FROM inscricoes WHERE id = ?',
            [req.params.id]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({ erro: 'Inscrição não encontrada.' });
        }

        res.json({ mensagem: 'Inscrição cancelada com sucesso.' });
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao cancelar inscrição.' });
    }
});

module.exports = router;
