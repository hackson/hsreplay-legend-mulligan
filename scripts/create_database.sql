DROP DATABASE IF EXISTS meta_mulligan;
CREATE DATABASE meta_mulligan;
USE meta_mulligan;
CREATE TABLE mulligan (
  replay_id VARCHAR(80) NOT NULL PRIMARY KEY,
  class INT,
  archetype INT,
  rank INT,
  legend_rank INT,
  deck_short_id VARCHAR(80),
  deck_code VARCHAR(500),
  opponent_class INT,
  opponent_archetype INT,
  opponent_rank INT,
  opponent_legend_rank INT,
  coin BOOL,
  win BOOL,
  start_card_1 VARCHAR(20),
  start_card_2 VARCHAR(20),
  start_card_3 VARCHAR(20),
  start_card_4 VARCHAR(20),
  mulligan_card_1 VARCHAR(20),
  mulligan_card_2 VARCHAR(20),
  mulligan_card_3 VARCHAR(20),
  mulligan_card_4 VARCHAR(20),
  game_build VARCHAR(80),
  ladder_season INT,
  time TIMESTAMP
);
