const config = require('./config');
const constants = require('./constants');
const mysql = require('mysql');
const util = require('./util');

class DbWrapper {
  constructor() {
    this.connection_ = mysql.createConnection(config.dbConfig);
    this.connection_.connect(
        err => err && console.error('Failed to connect: %s', err));
  }

  queryExistingIds(replayIds, callback) {
    this.connection_.query(
       'SELECT replay_id FROM mulligan WHERE replay_id IN (?)',
       [replayIds],
       (error, results) => {
         if (error) {
           throw error;
         }
         callback(results.map(result => result['replay_id']));
       });
  }

  storeMulligan(game, replay, startingCards, mulliganCards) {
    console.log(`Store ${startingCards} => ${mulliganCards}`);
    const mulliganRecord = this.createMulliganRecord_(
        game, replay, startingCards, mulliganCards);
    this.connection_.query(
        'INSERT INTO mulligan SET ?',
        mulliganRecord,
        (error, results) => {
          if (error) {
            throw error;
          }
        });
  }

  createMulliganRecord_(game, replay, startingCards, mulliganCards) {
    return {
      replay_id: replay[constants.REPLAY_ID_FIELD],
      'class': util.getClassId(game.getHeroClassName()),
      archetype: replay[constants.P1_ARCHETYPE_FIELD],
      rank: game.getRank(),
      legend_rank: game.getLegendRank(),
      deck_short_id: util.computeShortId(game.getCards()),
      deck_code: util.computeDeckCode(
          game.getFormat(), game.getHeroClassName(), game.getCards()),
      opponent_class: util.getClassId(game.getOpposingHeroClassName()),
      opponent_archetype: replay[constants.P2_ARCHETYPE_FIELD],
      opponent_rank: replay[constants.P2_RANK_FIELD],
      opponent_legend_rank: replay[constants.P2_LEGEND_RANK_FIELD],
      coin: startingCards.length == 4,
      win: game.hasWon(),
      start_card_1: startingCards[0],
      start_card_2: startingCards[1],
      start_card_3: startingCards[2],
      start_card_4: startingCards[3],
      mulligan_card_1: mulliganCards[0],
      mulligan_card_2: mulliganCards[1],
      mulligan_card_3: mulliganCards[2],
      mulligan_card_4: mulliganCards[3],
      game_build: game.getBuild(),
      ladder_season: game.getSeason(),
      time: game.getMatchEndTime(),
    }
  }
}

module.exports = DbWrapper;
