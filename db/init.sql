-- -- テスト用データベース
-- 拡張モジュールを有効化（管理者権限が必要）
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE conventions (
  id UUID PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  held_date DATE NOT NULL
);

CREATE TABLE players (
  id UUID PRIMARY KEY,
  convention_id UUID NOT NULL,
  name VARCHAR(50) NOT NULL,
  points INT DEFAULT 0,
  wins INT DEFAULT 0,
  draws INT DEFAULT 0,
  losses INT DEFAULT 0,
  goals INT DEFAULT 0,
  concede INT DEFAULT 0,
  CONSTRAINT fk_player_conventions FOREIGN KEY (convention_id)
    REFERENCES conventions(id)
);

CREATE TABLE matches (
  id UUID PRIMARY KEY,
  convention_id UUID NOT NULL,
  home_player_id UUID NOT NULL,
  away_player_id UUID NOT NULL,
  home_score INT NOT NULL,
  away_score INT NOT NULL,
  match_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_match_conventions FOREIGN KEY (convention_id)
    REFERENCES conventions(id)
);

CREATE TABLE scorers (
  id UUID PRIMARY KEY,
  match_id UUID NOT NULL,
  player_id UUID NOT NULL,
  name VARCHAR(50) NOT NULL,
  CONSTRAINT fk_scorer_players FOREIGN KEY (player_id)
    REFERENCES players(id),
  CONSTRAINT fk_scorer_matches FOREIGN KEY (match_id)
    REFERENCES matches(id)
);

CREATE TABLE assists (
  id UUID PRIMARY KEY,
  match_id UUID NOT NULL,
  player_id UUID NOT NULL,
  name VARCHAR(50) NOT NULL,
  CONSTRAINT fk_assists_players FOREIGN KEY (player_id)
    REFERENCES players(id),
  CONSTRAINT fk_assists_matches FOREIGN KEY (match_id)
    REFERENCES matches(id)
);

CREATE TABLE moms (
  id UUID PRIMARY KEY,
  match_id UUID NOT NULL,
  player_id UUID NOT NULL,
  name VARCHAR(50) NOT NULL,
  CONSTRAINT fk_moms_players FOREIGN KEY (player_id)
    REFERENCES players(id),
  CONSTRAINT fk_moms_matches FOREIGN KEY (match_id)
    REFERENCES matches(id)
);
