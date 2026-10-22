
CREATE DATABASE IF NOT EXISTS eventosenai;
USE eventosenai;

CREATE TABLE IF NOT EXISTS categorias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(60) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS eventos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(120) NOT NULL,
    descricao TEXT,
    data_evento DATETIME NOT NULL,
    local VARCHAR(100) NOT NULL,
    vagas INT NOT NULL CHECK (vagas > 0),
    categoria_id INT NOT NULL,
    FOREIGN KEY (categoria_id) REFERENCES categorias(id)
);

CREATE TABLE IF NOT EXISTS participantes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS inscricoes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    evento_id INT NOT NULL,
    participante_id INT NOT NULL,
    data_inscricao DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (evento_id, participante_id),
    FOREIGN KEY (evento_id) REFERENCES eventos(id) ON DELETE CASCADE,
    FOREIGN KEY (participante_id) REFERENCES participantes(id) ON DELETE CASCADE
);

INSERT INTO categorias (nome)
VALUES
    ('Palestra'),
    ('Oficina'),
    ('Workshop');

INSERT INTO eventos (titulo, descricao, data_evento, local, vagas, categoria_id)
VALUES
    ('Palestra sobre Tecnologia', 'Introdução à tecnologia e inovação', '2026-11-10 19:00:00', 'Auditório SENAI', 50, 1),
    ('Oficina de Programação', 'Atividade prática de programação', '2026-11-12 14:00:00', 'Laboratório de Informática', 25, 2),
    ('Workshop de Robótica', 'Introdução à robótica e automação', '2026-11-15 09:00:00', 'Sala de Robótica', 30, 3);

INSERT INTO participantes (nome, email)
VALUES
    ('Ana Silva', 'ana@email.com'),
    ('Pedro Santos', 'pedro@email.com'),
    ('Maria Oliveira', 'maria@email.com');

INSERT INTO inscricoes (evento_id, participante_id)
VALUES
    (1, 1),
    (1, 2),
    (2, 3);

SELECT * FROM categorias;

SELECT * FROM eventos;

SELECT * FROM participantes;

SELECT * FROM inscricoes;

SELECT
    e.id,
    e.titulo,
    e.data_evento,
    e.local,
    e.vagas,
    c.nome AS categoria
FROM eventos e
INNER JOIN categorias c
    ON e.categoria_id = c.id;

SELECT
    p.id,
    p.nome,
    p.email,
    i.data_inscricao
FROM inscricoes i
INNER JOIN participantes p
    ON i.participante_id = p.id
WHERE i.evento_id = 1;

SELECT
    e.id,
    e.titulo,
    e.vagas,
    COUNT(i.participante_id) AS total_inscritos,
    (e.vagas - COUNT(i.participante_id)) AS vagas_restantes
FROM eventos e
LEFT JOIN inscricoes i
    ON e.id = i.evento_id
GROUP BY e.id, e.titulo, e.vagas;
