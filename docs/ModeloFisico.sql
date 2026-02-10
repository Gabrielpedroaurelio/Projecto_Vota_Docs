DROP DATABASE IF EXISTS vota_aqui
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE vota_aqui;

CREATE TABLE Usuario (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nome_usuario VARCHAR(100) NOT NULL,
    email_usuario VARCHAR(150) NOT NULL UNIQUE,
    senha_usuario VARCHAR(255) NOT NULL,
    caminho_imagem VARCHAR(255),
    ultimo_login DATETIME,
    status ENUM('ativo', 'inativo', 'banido') DEFAULT 'ativo',
    tipo_usuario ENUM('admin', 'usuario') DEFAULT 'usuario',
    criado_em datetime DEFAULT CURRENT_TIMESTAMP ,
    actualizado_em datetime default CURRENT_TIMESTAMP on update
) ENGINE=InnoDB;


CREATE TABLE Enquete (
    id_enquete INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(150) NOT NULL,
    descricao TEXT,
    data_inicio DATETIME NOT NULL,
    data_fim DATETIME,
    status ENUM('ativa', 'encerrada') DEFAULT 'ativa',
    id_usuario INT NOT NULL, FOREIGN KEY REFERENCES Usuario(id_usuario) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE OpcaoVoto (
    id_opcao_voto INT AUTO_INCREMENT PRIMARY KEY,
    designacao VARCHAR(100) NOT NULL,
    descricao TEXT
) ENGINE=InnoDB;


CREATE TABLE Enquete_Opcao_Voto (
    id_enquete_opcao_voto INT AUTO_INCREMENT PRIMARY KEY,
    id_enquete INT NOT NULL FOREIGN KEY 
        REFERENCES Enquete(id_enquete)
        ON DELETE CASCADE,
    id_opcao_voto INT NOT NULL FOREIGN KEY 
        REFERENCES OpcaoVoto(id_opcao_voto)
        ON DELETE CASCADE,
    UNIQUE (id_enquete, id_opcao_voto) -- validacao para garantir que em um enquete nao tenha opções repetidas
) ENGINE=InnoDB;

CREATE TABLE Voto (
    id_voto INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL, FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario) ON DELETE CASCADE,
    id_opcao_voto INT NOT NULL, FOREIGN KEY  REFERENCES OpcaoVoto(id_opcao_voto),
    id_enquete INT NOT NULL,  FOREIGN KEY (id_enquete) REFERENCES Enquete(id_enquete),
    data_voto DATETIME DEFAULT CURRENT_TIMESTAMP,       
    UNIQUE (id_usuario, id_enquete) -- validacao para garantir que o usuario apenas possa vota em uma vez em cada enquete
) ENGINE=InnoDB;

/*
AGORA A MINHA PARTE FAVORITA, OPTIMIZANDO AS BUSCAS POR DADOS
*/
CREATE INDEX idx_usuario_email ON Usuario(email_usuario);
CREATE INDEX idx_enquete_status ON Enquete(status);
CREATE INDEX idx_enquete_titulo ON Enquete(titulo);
CREATE INDEX idx_voto_enquete ON Voto(id_enquete);
CREATE INDEX idx_voto_opcao ON Voto(id_opcao_voto);

/*
SELECTS PERSONALIZADO MUITO NÃO USAM, MAS EU USO
*/
/*
estrutura
enquete : total votos, opvao: total_voto_opcao
*/
CREATE VIEW vw_resultado_enquete as 
SELECT Enquete.id_enquete, Enquete.titulo, Enquete.status, OpcaoVoto.designacao, OpcaoVoto.id_opcao_voto,
COUNT(Voto.id_enquete) as total_votos from Enquete  join Enquete_Opcao_Voto on Enquete.id_enquete= Enquete_Opcao_Voto.id_enquete join 
OpcaoVoto on OpcaoVoto.id_opcao_voto= Enquete_Opcao_Voto.id_opcao_voto 
left join Voto on Voto.id_opcao_voto= OpcaoVoto.id_opcao_voto and Voto.id_enquete=enquete.id_enquete
GROUP by Enquete.id_enquete, OpcaoVoto.id_opcao_voto;

CREATE VIEW vw_enquetes_usuario AS
SELECT
    Usuario.id_usuario,
    Usuario.nome_usuario,
    Enquete.id_enquete,
    Enquete.titulo,
    Enquete.status
FROM Usuario 
JOIN Enquete  ON Enquete.id_usuario = Usuario.id_usuario;


/*
MINHAS FUNÇÕES ACHO QUE VOU DOCUMENTAR
*/
DELIMITER $$
/*
    A fn_total_votos_enquete é uma função que vai retornar o total de votos para o determinado enquete que é passado pelo paramentro p_id_enquete, vai dar um select em votos e o resultado do select vai guardar na variavel total e depois vai retornar o valor, simples e prático
*/
CREATE FUNCTION fn_total_votos_enquete(p_id_enquete INT)
RETURNS INT
BEGIN
    DECLARE total INT;
    SELECT COUNT(*) INTO total
    FROM Voto
    WHERE id_enquete = p_id_enquete;
    RETURN total;
END$$

/*
     A função fn_total_votos_opcao que retorna o total de votos para uma determinada opcao de voto em um determinado enquete onde a opcao de voto está vinculada, ela recebe dois params e faz um select em votos retornado todos os votos onde a enquete e a opcao de voto corresponde com os params passados, e atribui isso a variavel total que é declarada na quarta linha da funcao 
*/
CREATE FUNCTION fn_total_votos_opcao(p_id_enquete INT, p_id_opcao INT)
RETURNS INT
BEGIN
    DECLARE total INT;
    SELECT COUNT(*) INTO total
    FROM Voto
    WHERE id_enquete = p_id_enquete
      AND id_opcao_voto = p_id_opcao;
    RETURN total;
END$$

DELIMITER ;


/*
Vou ser bem honesto trigger, conceito que eu aprendir, mas que uso pouco por causa da necessidade estou um pouco enferrujado eu sei mas vamos lá lembrar um pouco do assunto "TRIGGERS",
AS TRIGGERS: são gatilhos disparado antes, quando e depois de um evento acontencer, eu acho, é o que eu lembro mas vamos continuar, Eu criei 2 triggers uma para bloqueiar a enquete para nao permitir votos e outro para encerrar a enquete caso o prazo passe, algo que percebe é que triggers se definem de maneira muito obvia observe:
*/

DELIMITER $$
/**/
CREATE TRIGGER trg_bloqueia_voto_enquete_encerrada--  criar trigger trg_bloqueia_voto_enquete_encerrada
BEFORE INSERT ON Voto -- antes de inserir no Voto 
FOR EACH ROW -- para cada linha
BEGIN --comece
    DECLARE v_status VARCHAR(20); -- defina/ declare uma variavel status

    SELECT status INTO v_status-- agora seleciona status e coloque an variavel status
    FROM Enquete -- que viram de Enquete
    WHERE id_enquete = NEW.id_enquete; -- onde id_enquete == novo_dado_a_ser_adicionado[nesse_caso_novo_voto].id_enquete, o que será cadastrador na hora de votar ou referenciado pois a enqeute já esta criada

    IF v_status <> 'ativa' THEN -- se o status for diferente de ativa entao
        SIGNAL SQLSTATE '45000'-- lança esse erro do MySql, 
        SET MESSAGE_TEXT = 'Enquete não está ativa para votação.'; -- define esta variavel e exiba a msm
    END IF;
END$$
/*
Estou cansado acho que não vou comentar esse triggers a estrutura ja diz o que ele faz
*/

CREATE TRIGGER trg_encerrar_enquete
BEFORE UPDATE ON Enquete
FOR EACH ROW
BEGIN
    IF NEW.data_fim IS NOT NULL
       AND NEW.data_fim < NOW() THEN
        SET NEW.status = 'encerrada';
    END IF;
END$$

DELIMITER ;
