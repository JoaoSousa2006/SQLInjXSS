USE neverend_lab;

CREATE TABLE IF NOT EXISTS users (
  id INT UNSIGNED NOT NULL PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(180) NOT NULL,
  role VARCHAR(60) NOT NULL,
  status VARCHAR(30) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS comments (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  author VARCHAR(80) NOT NULL,
  comment TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS logs (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  event VARCHAR(80) NOT NULL,
  scenario VARCHAR(80) NOT NULL,
  input_text VARCHAR(2000) NOT NULL,
  outcome TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO users (id, name, email, role, status) VALUES
  (1, 'Alice Almeida', 'alice@example.test', 'analista', 'Ativo'),
  (2, 'Bruno Costa', 'bruno@example.test', 'operador', 'Ativo'),
  (3, 'Carolina Dias', 'carol@example.test', 'gestora', 'Ativo'),
  (4, 'Diego Ferreira', 'diego@example.test', 'operador', 'Inativo'),
  (5, 'Eduarda Gomes', 'eduarda@example.test', 'analista', 'Ativo'),
  (6, 'Felipe Nunes', 'felipe@example.test', 'auditor', 'Ativo')
ON DUPLICATE KEY UPDATE
  name = VALUES(name), email = VALUES(email), role = VALUES(role), status = VALUES(status);

-- O usuário do aplicativo pode consultar dados do laboratório e enumerar schemas
-- no MySQL local para que SHOW DATABASES funcione na demonstração SQLi.
GRANT SHOW DATABASES ON *.* TO 'neverend'@'%';
