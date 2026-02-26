DROP DATABASE IF EXISTS vota_aqui;
CREATE DATABASE vota_aqui
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE vota_aqui;
 
-- =========================
-- TABLE: User
-- =========================
CREATE TABLE User (
    id_user INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    path_thumb VARCHAR(255),
    last_login DATETIME,
    status ENUM('active', 'inactive', 'banned') DEFAULT 'active',
    user_type ENUM('admin', 'user') DEFAULT 'user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP 
        ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- =========================
-- TABLE: Poll
-- =========================
CREATE TABLE Poll (
    id_poll INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    start_date DATETIME NOT NULL,
    end_date DATETIME,
    status ENUM('active', 'closed') DEFAULT 'active',
    id_user INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP 
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_poll_user
        FOREIGN KEY (id_user)
        REFERENCES User(id_user)
        ON DELETE CASCADE,

    CHECK (end_date IS NULL OR end_date > start_date)
) ENGINE=InnoDB;

-- =========================
-- TABLE: VoteOption
-- =========================
CREATE TABLE VoteOption (
    id_option INT AUTO_INCREMENT PRIMARY KEY,
    designation VARCHAR(100) NOT NULL,
    description TEXT
) ENGINE=InnoDB;

-- =========================
-- TABLE: Poll_VoteOption (Bridge)
-- =========================
CREATE TABLE Poll_VoteOption (
    id_poll_option INT AUTO_INCREMENT PRIMARY KEY,
    id_poll INT NOT NULL,
    id_option INT NOT NULL,

    CONSTRAINT fk_pvo_poll
        FOREIGN KEY (id_poll)
        REFERENCES Poll(id_poll)
        ON DELETE CASCADE,

    CONSTRAINT fk_pvo_option
        FOREIGN KEY (id_option)
        REFERENCES VoteOption(id_option)
        ON DELETE CASCADE,

    UNIQUE (id_poll, id_option)
) ENGINE=InnoDB;

-- =========================
-- TABLE: Vote
-- =========================
CREATE TABLE Vote (
    id_vote INT AUTO_INCREMENT PRIMARY KEY,
    id_user INT NOT NULL,
    id_poll_option INT NOT NULL,
    vote_date DATETIME DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_vote_user
        FOREIGN KEY (id_user)
        REFERENCES User(id_user)
        ON DELETE CASCADE,

    CONSTRAINT fk_vote_pvo
        FOREIGN KEY (id_poll_option)
        REFERENCES Poll_VoteOption(id_poll_option)
        ON DELETE CASCADE,

    UNIQUE (id_user, id_poll_option)
) ENGINE=InnoDB;

-- =========================
-- TABLE: ActivityLog
-- =========================
CREATE TABLE ActivityLog (
    id_log INT AUTO_INCREMENT PRIMARY KEY,
    id_user INT NOT NULL,
    table_name VARCHAR(100) NOT NULL,
    row_id INT,
    action ENUM('Insert', 'Update', 'Delete') NOT NULL,
    old_data JSON,
    new_data JSON,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_activity_user
        FOREIGN KEY (id_user)
        REFERENCES User(id_user)
        ON DELETE CASCADE
) ENGINE=InnoDB;

-- =========================
-- TABLE: LoginLog
-- =========================
CREATE TABLE LoginLog (
    id_login_log INT AUTO_INCREMENT PRIMARY KEY,
    id_user INT NOT NULL,
    ip_address VARCHAR(45),
    device_info TEXT,
    browser_info TEXT,
    login_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    logout_time DATETIME,

    CONSTRAINT fk_login_user
        FOREIGN KEY (id_user)
        REFERENCES User(id_user)
        ON DELETE CASCADE
) ENGINE=InnoDB;

-- =========================
-- PERFORMANCE INDEXES
-- =========================
CREATE INDEX idx_user_email ON User(email);
CREATE INDEX idx_poll_status ON Poll(status);
CREATE INDEX idx_poll_title ON Poll(title);
CREATE INDEX idx_vote_pvo ON Vote(id_poll_option);

-- =========================
-- VIEW: Poll Results
-- =========================
CREATE VIEW vw_poll_results AS
SELECT 
    p.id_poll,
    p.title,
    p.status,
    vo.id_option,
    vo.designation,
    COUNT(v.id_vote) AS total_votes
FROM Poll p
JOIN Poll_VoteOption pvo ON p.id_poll = pvo.id_poll
JOIN VoteOption vo ON vo.id_option = pvo.id_option
LEFT JOIN Vote v ON v.id_poll_option = pvo.id_poll_option
GROUP BY p.id_poll, vo.id_option;

-- =========================
-- FUNCTIONS
-- =========================
DELIMITER $$

CREATE FUNCTION fn_poll_total_votes(p_id_poll INT)
RETURNS INT
DETERMINISTIC
BEGIN
    DECLARE total INT;
    SELECT COUNT(v.id_vote) INTO total
    FROM Vote v
    JOIN Poll_VoteOption pvo ON v.id_poll_option = pvo.id_poll_option
    WHERE pvo.id_poll = p_id_poll;
    RETURN IFNULL(total, 0);
END$$

CREATE FUNCTION fn_option_total_votes(p_id_poll INT, p_id_option INT)
RETURNS INT
DETERMINISTIC
BEGIN
    DECLARE total INT;
    SELECT COUNT(v.id_vote) INTO total
    FROM Vote v
    JOIN Poll_VoteOption pvo ON v.id_poll_option = pvo.id_poll_option
    WHERE pvo.id_poll = p_id_poll AND pvo.id_option = p_id_option;
    RETURN IFNULL(total, 0);
END$$

DELIMITER ;

-- =========================
-- TRIGGERS
-- =========================
DELIMITER $$

CREATE TRIGGER trg_block_vote_closed_poll
BEFORE INSERT ON Vote
FOR EACH ROW
BEGIN
    DECLARE v_status VARCHAR(20);
    SELECT p.status INTO v_status
    FROM Poll p
    JOIN Poll_VoteOption pvo ON p.id_poll = pvo.id_poll
    WHERE pvo.id_poll_option = NEW.id_poll_option;

    IF v_status <> 'active' THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'This poll is no longer active for voting.';
    END IF;
END$$

CREATE TRIGGER trg_auto_close_poll
BEFORE UPDATE ON Poll
FOR EACH ROW
BEGIN
    IF NEW.end_date IS NOT NULL AND NEW.end_date < NOW() THEN
        SET NEW.status = 'closed';
    END IF;
END$$

DELIMITER ;