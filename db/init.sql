-- -- テスト用データベース
-- 拡張モジュールを有効化（管理者権限が必要）
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE conventions (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  held_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE players (
  id SERIAL PRIMARY KEY,
  convention_id INT NOT NULL,
  name VARCHAR(50) NOT NULL,
  points INT DEFAULT 0,
  CONSTRAINT fk_player_conventions FOREIGN KEY (convention_id)
    REFERENCES conventions(id)
);

CREATE TABLE matches (
  id SERIAL PRIMARY KEY,
  convention_id INT NOT NULL,
  home_player_id INT NOT NULL,
  away_player_id INT NOT NULL,
  home_score INT NOT NULL,
  away_score INT NOT NULL,
  match_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_match_conventions FOREIGN KEY (convention_id)
    REFERENCES conventions(id)
);
