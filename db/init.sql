CREATE TABLE players (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  points INT DEFAULT 0
);

CREATE TABLE matches (
  id SERIAL PRIMARY KEY,
  home_player VARCHAR(50) NOT NULL,
  away_player VARCHAR(50) NOT NULL,
  home_score INT NOT NULL,
  away_score INT NOT NULL,
  match_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);