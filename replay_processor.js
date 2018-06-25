const Game = require('./game');
const constants = require('./constants');
const elementtree = require('elementtree');
const replayParser = require('./replay_parser');
const util = require('./util');
const zlib = require('zlib');

class ReplayProcessor {
  constructor(dbWrapper) {
    this.dbWrapper_ = dbWrapper;
  }

  process(replays) {
    for (const replay of replays) {
      const replayId = replay[constants.REPLAY_ID_FIELD];
      const gameUrl = `${constants.HSREPLAY_GAME_PATH_PREFIX}${replayId}`;
      util.fetchJson(gameUrl, gameJson => this.handleGame_(replay, gameJson));
    }
  }

  handleGame_(replayMetadata, gameJson) {
    const game = new Game(gameJson);
    const replayXmlUrl = game.getReplayXml(); 
    util.fetch(
        replayXmlUrl,
        replayXmlBuffer => {
          const replayXml = elementtree.parse(
            zlib.gunzipSync(replayXmlBuffer).toString('utf8'));
          this.processGameAndReplay_(game, replayMetadata, replayXml);
        });
  }

  processGameAndReplay_(game, replayMetadata, replayXml) {
    const startingCards = replayParser.getStartingCards(replayXml);
    const mulliganCards = replayParser.getMulliganCards(game, replayXml);
    this.dbWrapper_.storeMulligan(
        game, replayMetadata, startingCards, mulliganCards);
  }
}

module.exports = ReplayProcessor;
