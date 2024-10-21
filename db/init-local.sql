-- 開発用データベース
CREATE DATABASE maemob;

\c maemob;

CREATE TABLE players (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  points INT DEFAULT 0
);

CREATE TABLE matches (
  id SERIAL PRIMARY KEY,
  home_player_id INT NOT NULL,
  away_player_id INT NOT NULL,
  home_score INT NOT NULL,
  away_score INT NOT NULL,
  match_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- テスト用データベース
CREATE DATABASE maemob_test;

\c maemob_test;

CREATE TABLE players (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  points INT DEFAULT 0
);

CREATE TABLE matches (
  id SERIAL PRIMARY KEY,
  home_player_id INT NOT NULL,
  away_player_id INT NOT NULL,
  home_score INT NOT NULL,
  away_score INT NOT NULL,
  match_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
